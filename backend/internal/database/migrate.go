package database

import (
	"MercFlow/internal/config"
	"context"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"github.com/jackc/pgx/v5"
)

func RunMigrations() error {
	cfg, err := config.Load()
	if err != nil {
		return err
	}

	// Usa protocolo simples para permitir múltiplos comandos SQL por migration.
	connConfig, err := pgx.ParseConfig(cfg.Database.URL)
	if err != nil {
		return err
	}
	connConfig.DefaultQueryExecMode = pgx.QueryExecModeSimpleProtocol

	conn, err := pgx.ConnectConfig(context.Background(), connConfig)
	if err != nil {
		return err
	}
	defer conn.Close(context.Background())

	// Cria a tabela de controle de versão, se não existir.
	if _, err := conn.Exec(context.Background(), `
		CREATE TABLE IF NOT EXISTS schema_migrations (
			version VARCHAR(255) PRIMARY KEY,
			applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
		);
	`); err != nil {
		return fmt.Errorf("erro ao criar schema_migrations: %w", err)
	}

	arquivos, err := os.ReadDir("migrations")
	if err != nil {
		return err
	}

	var migrations []string
	for _, arquivo := range arquivos {
		if strings.HasSuffix(arquivo.Name(), ".up.sql") {
			migrations = append(migrations, arquivo.Name())
		}
	}
	sort.Strings(migrations)

	fmt.Println("Migrations encontradas:")
	for _, m := range migrations {
		fmt.Println("-", m)
	}

	for _, migration := range migrations {
		version := strings.TrimSuffix(migration, ".up.sql")

		// Pula se já foi aplicada.
		var jaAplicada bool
		if err := conn.QueryRow(
			context.Background(),
			`SELECT EXISTS (SELECT 1 FROM schema_migrations WHERE version = $1)`,
			version,
		).Scan(&jaAplicada); err != nil {
			return err
		}
		if jaAplicada {
			fmt.Printf("- %s já aplicada, pulando\n", migration)
			continue
		}

		caminho := filepath.Join("migrations", migration)
		sqlBytes, err := os.ReadFile(caminho)
		if err != nil {
			return err
		}

		// Executa a migration dentro de uma transação.
		tx, err := conn.Begin(context.Background())
		if err != nil {
			return err
		}

		if _, err := tx.Exec(context.Background(), string(sqlBytes)); err != nil {
			_ = tx.Rollback(context.Background())
			return fmt.Errorf("erro ao executar migration %s: %w", migration, err)
		}

		if _, err := tx.Exec(
			context.Background(),
			`INSERT INTO schema_migrations (version) VALUES ($1)`,
			version,
		); err != nil {
			_ = tx.Rollback(context.Background())
			return fmt.Errorf("erro ao registrar migration %s: %w", migration, err)
		}

		if err := tx.Commit(context.Background()); err != nil {
			return fmt.Errorf("erro ao confirmar migration %s: %w", migration, err)
		}

		fmt.Printf("- %s aplicada com sucesso\n", migration)
	}

	fmt.Println("Todas as migrations processadas com sucesso!")

	rows, err := conn.Query(context.Background(), `
		SELECT tablename
		FROM pg_tables
		WHERE schemaname = 'public'
	`)
	if err != nil {
		return err
	}
	defer rows.Close()

	fmt.Println("Tabelas existentes:")
	for rows.Next() {
		var nome string
		_ = rows.Scan(&nome)
		fmt.Println("-", nome)
	}

	return nil
}
