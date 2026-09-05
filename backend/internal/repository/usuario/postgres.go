package usuario

import (
	"MercFlow/internal/models"
	"context"
	"errors"
	"log"
	"os"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"
)

type PostgresUsuarioRepository struct {
	db *pgxpool.Pool
}

func NovoPostgresUsuarioRepository(db *pgxpool.Pool) *PostgresUsuarioRepository {
	return &PostgresUsuarioRepository{db: db}
}

func (r *PostgresUsuarioRepository) BuscarPorUsername(username string) (*models.Usuario, error) {
	if strings.TrimSpace(username) == "" {
		return nil, errors.New("username obrigatório")
	}

	usuario := &models.Usuario{}
	row := r.db.QueryRow(context.Background(), `
		SELECT u.id, u.nome, u.username, u.senha_hash, u.loja_id, l.nome, u.perfil, u.permissoes, u.ativo, u.criado_em::text
		FROM usuarios u JOIN lojas l ON l.id = u.loja_id
		WHERE LOWER(username) = LOWER($1)
		LIMIT 1;
	`, username)

	if err := row.Scan(
		&usuario.ID,
		&usuario.Nome,
		&usuario.Username,
		&usuario.SenhaHash,
		&usuario.LojaID,
		&usuario.LojaNome,
		&usuario.Perfil,
		&usuario.Permissoes,
		&usuario.Ativo,
		&usuario.CriadoEm,
	); err != nil {
		return nil, err
	}

	return usuario, nil
}

func (r *PostgresUsuarioRepository) BuscarPorID(id int) (*models.Usuario, error) {
	if id <= 0 {
		return nil, errors.New("id inválido")
	}

	usuario := &models.Usuario{}
	row := r.db.QueryRow(context.Background(), `
		SELECT u.id, u.nome, u.username, u.senha_hash, u.loja_id, l.nome, u.perfil, u.permissoes, u.ativo, u.criado_em::text
		FROM usuarios u JOIN lojas l ON l.id = u.loja_id
		WHERE id = $1
		LIMIT 1;
	`, id)

	if err := row.Scan(
		&usuario.ID,
		&usuario.Nome,
		&usuario.Username,
		&usuario.SenhaHash,
		&usuario.LojaID,
		&usuario.LojaNome,
		&usuario.Perfil,
		&usuario.Permissoes,
		&usuario.Ativo,
		&usuario.CriadoEm,
	); err != nil {
		return nil, err
	}

	return usuario, nil
}

func (r *PostgresUsuarioRepository) ListarPorLoja(lojaID int) ([]*models.Usuario, error) {
	if lojaID <= 0 {
		return nil, errors.New("loja inválida")
	}

	rows, err := r.db.Query(context.Background(), `
		SELECT u.id, u.nome, u.username, u.senha_hash, u.loja_id, l.nome, u.perfil, u.permissoes, u.ativo, u.criado_em::text
		FROM usuarios u JOIN lojas l ON l.id = u.loja_id
		WHERE loja_id = $1
		ORDER BY nome ASC;
	`, lojaID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	usuarios := []*models.Usuario{}
	for rows.Next() {
		usuario := &models.Usuario{}
		if err := rows.Scan(
			&usuario.ID,
			&usuario.Nome,
			&usuario.Username,
			&usuario.SenhaHash,
			&usuario.LojaID,
			&usuario.LojaNome,
			&usuario.Perfil,
			&usuario.Permissoes,
			&usuario.Ativo,
			&usuario.CriadoEm,
		); err != nil {
			return nil, err
		}
		usuarios = append(usuarios, usuario)
	}

	return usuarios, nil
}

func (r *PostgresUsuarioRepository) ListarTodos() ([]*models.Usuario, error) {
	rows, err := r.db.Query(context.Background(), `
		SELECT u.id, u.nome, u.username, u.senha_hash, u.loja_id, l.nome, u.perfil, u.permissoes, u.ativo, u.criado_em::text
		FROM usuarios u JOIN lojas l ON l.id = u.loja_id ORDER BY u.loja_id, u.nome ASC;
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	usuarios := []*models.Usuario{}
	for rows.Next() {
		usuario := &models.Usuario{}
		if err := rows.Scan(&usuario.ID, &usuario.Nome, &usuario.Username, &usuario.SenhaHash, &usuario.LojaID, &usuario.LojaNome, &usuario.Perfil, &usuario.Permissoes, &usuario.Ativo, &usuario.CriadoEm); err != nil {
			return nil, err
		}
		usuarios = append(usuarios, usuario)
	}
	return usuarios, rows.Err()
}

func (r *PostgresUsuarioRepository) Criar(usuario *models.Usuario) (*models.Usuario, error) {
	if usuario == nil {
		return nil, errors.New("usuário inválido")
	}

	if strings.TrimSpace(usuario.Username) == "" {
		return nil, errors.New("username obrigatório")
	}

	if strings.TrimSpace(usuario.SenhaHash) == "" {
		return nil, errors.New("senha obrigatória")
	}

	if usuario.LojaID <= 0 {
		return nil, errors.New("loja obrigatória")
	}

	if usuario.Perfil == "" {
		usuario.Perfil = "operador"
	}

	if len(usuario.Permissoes) == 0 {
		usuario.Permissoes = []string{
			"dashboard.read",
			"lancamento.create",
			"lancamento.read",
			"lancamento.calculate",
			"produto.read",
			"departamento.read",
		}
	}

	var id int
	err := r.db.QueryRow(context.Background(), `
		INSERT INTO usuarios (nome, username, senha_hash, loja_id, perfil, permissoes, ativo)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id;
	`, usuario.Nome, usuario.Username, usuario.SenhaHash, usuario.LojaID, usuario.Perfil, usuario.Permissoes, true).Scan(&id)
	if err != nil {
		return nil, err
	}

	usuario.ID = id
	usuario.Ativo = true
	return usuario, nil
}

func (r *PostgresUsuarioRepository) CriarOuAtualizarAdminPadrao() error {
	lojaID, err := r.buscarOuCriarLojaPadrao()
	if err != nil {
		return err
	}

	adminUsername := strings.TrimSpace(os.Getenv("ADMIN_USERNAME"))
	if adminUsername == "" {
		return errors.New("ADMIN_USERNAME não configurado")
	}
	adminPassword := os.Getenv("ADMIN_PASSWORD")
	if adminPassword == "" {
		return errors.New("ADMIN_PASSWORD não configurado")
	}
	if len(adminPassword) < 12 {
		return errors.New("ADMIN_PASSWORD deve ter pelo menos 12 caracteres")
	}
	log.Printf("seed do admin: username=%q tamanho_senha=%d", adminUsername, len(adminPassword))

	senhaHash, err := bcrypt.GenerateFromPassword([]byte(adminPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	nome := "Administrador"
	username := adminUsername
	novoHash := string(senhaHash)

	var existe bool
	err = r.db.QueryRow(context.Background(), `
		SELECT EXISTS (
			SELECT 1 FROM usuarios WHERE LOWER(username) = LOWER($1)
		);
	`, username).Scan(&existe)
	if err != nil {
		return err
	}

	if existe {
		_, err = r.db.Exec(context.Background(), `
			UPDATE usuarios
			SET nome = $1,
				senha_hash = $2,
				loja_id = $3,
				perfil = 'super_admin',
				permissoes = $4,
				ativo = true
			WHERE LOWER(username) = LOWER($5);
		`, nome, novoHash, lojaID, []string{
			"dashboard.read",
			"dashboard.export",
			"lancamento.create",
			"lancamento.read",
			"lancamento.calculate",
			"produto.read",
			"produto.create",
			"produto.update",
			"departamento.read",
			"departamento.create",
			"usuario.read",
			"usuario.create",
			"usuario.update",
		}, username)
		return err
	}

	_, err = r.db.Exec(context.Background(), `
		INSERT INTO usuarios (nome, username, senha_hash, loja_id, perfil, permissoes, ativo)
		VALUES ($1, $2, $3, $4, 'super_admin', $5, true);
	`, nome, username, novoHash, lojaID, []string{
		"dashboard.read",
		"dashboard.export",
		"lancamento.create",
		"lancamento.read",
		"produto.read",
		"produto.create",
		"produto.update",
		"departamento.read",
		"departamento.create",
		"usuario.read",
		"usuario.create",
		"usuario.update",
	})
	return err
}

func (r *PostgresUsuarioRepository) buscarOuCriarLojaPadrao() (int, error) {
	var lojaID int
	err := r.db.QueryRow(context.Background(), `
		SELECT id FROM lojas WHERE LOWER(codigo) = LOWER('loja-principal') LIMIT 1;
	`).Scan(&lojaID)
	if err == nil {
		return lojaID, nil
	}

	var novoID int
	err = r.db.QueryRow(context.Background(), `
		INSERT INTO lojas (nome, codigo, ativo)
		VALUES ($1, $2, true)
		RETURNING id;
	`, "Loja Principal", "loja-principal").Scan(&novoID)
	if err != nil {
		return 0, err
	}

	return novoID, nil
}
