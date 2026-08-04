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
	if err != nil{
		return err
	}

	fmt.Println("DATABASE_URL Runner:", cfg.Database.URL)

	conn, err := pgx.Connect(
		context.Background(),
		cfg.Database.URL,
	)
	if err != nil{
		return err
	}
	defer conn.Close(context.Background())

	arquivos, err := os.ReadDir("migrations")
	if err != nil{
		return err
	}

	fmt.Println("Arquivos encontrados:")

	for _, arquivo := range arquivos {
		fmt.Println("-", arquivo.Name())
	}

	var migrations []string

	for _, arquivo := range arquivos{
		if strings.HasSuffix(arquivo.Name(), ".up.sql") {
			migrations = append(migrations, arquivo.Name())
		}
	}

	sort.Strings(migrations)

	fmt.Println("Migrations filtradas:")

	for _, m := range migrations {
		fmt.Println("-", m)
	}

	for _, migration := range migrations{
		caminho := filepath.Join("migrations",migration)

		sqlBytes, err := os.ReadFile(caminho)
		if err != nil{
			return err
		}

		fmt.Printf("Executando: %s\n", migration)

		fmt.Println("================================")
		fmt.Println("Migration:", migration)
		fmt.Println(string(sqlBytes))
		fmt.Println("================================")

		tag, err := conn.Exec(
			context.Background(),
			string(sqlBytes),
		)
		fmt.Println("CommandTag:", tag)
		if err != nil{
			return fmt.Errorf("%s: %w", migration, err)
		}
	}
	fmt.Println("Todas as migrations executadas com sucesso!")

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
		rows.Scan(&nome)
		fmt.Println("-", nome)
	}

	return nil
}