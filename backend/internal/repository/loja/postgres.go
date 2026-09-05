package loja

import (
	"MercFlow/internal/models"
	"context"
	"errors"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"
)

type PostgresLojaRepository struct {
	db *pgxpool.Pool
}

func NovoPostgresLojaRepository(db *pgxpool.Pool) *PostgresLojaRepository {
	return &PostgresLojaRepository{db: db}
}

func (r *PostgresLojaRepository) Criar(loja *models.Loja) (*models.Loja, error) {
	if loja == nil {
		return nil, errors.New("loja inválida")
	}
	if strings.TrimSpace(loja.Nome) == "" {
		return nil, errors.New("nome da loja obrigatório")
	}
	if strings.TrimSpace(loja.Codigo) == "" {
		return nil, errors.New("código da loja obrigatório")
	}

	var id int
	err := r.db.QueryRow(context.Background(), `
		INSERT INTO lojas (nome, codigo, ativo)
		VALUES ($1, $2, true)
		RETURNING id;
	`, loja.Nome, loja.Codigo).Scan(&id)
	if err != nil {
		return nil, err
	}

	loja.ID = id
	loja.Ativo = true
	return loja, nil
}

func (r *PostgresLojaRepository) Listar() ([]*models.Loja, error) {
	rows, err := r.db.Query(context.Background(), `
		SELECT id, nome, codigo, ativo, criado_em::text
		FROM lojas
		ORDER BY nome ASC;
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	lojas := []*models.Loja{}
	for rows.Next() {
		loja := &models.Loja{}
		if err := rows.Scan(&loja.ID, &loja.Nome, &loja.Codigo, &loja.Ativo, &loja.CriadoEm); err != nil {
			return nil, err
		}
		lojas = append(lojas, loja)
	}

	return lojas, nil
}

func (r *PostgresLojaRepository) BuscarID(id int) (*models.Loja, error) {
	loja := &models.Loja{}
	row := r.db.QueryRow(context.Background(), `
		SELECT id, nome, codigo, ativo, criado_em::text
		FROM lojas
		WHERE id = $1;
	`, id)
	err := row.Scan(&loja.ID, &loja.Nome, &loja.Codigo, &loja.Ativo, &loja.CriadoEm)
	if err != nil {
		return nil, err
	}
	return loja, nil
}
