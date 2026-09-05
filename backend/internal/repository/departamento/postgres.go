package departamento

import (
	"MercFlow/internal/models"
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type PostgresDepartamentoRepository struct {
	db *pgxpool.Pool
}

func NovoPostgresDepartamentoRepository(db *pgxpool.Pool) *PostgresDepartamentoRepository {
	return &PostgresDepartamentoRepository{
		db: db,
	}
}

func (r *PostgresDepartamentoRepository) Criar(d *models.Departamento) (*models.Departamento, error) {
	err := r.db.QueryRow(context.Background(), "INSERT INTO departamentos (nome, loja_id) VALUES ($1, $2) RETURNING id", d.Nome, d.LojaID).Scan(&d.ID)

	if err != nil {
		return nil, err
	}

	return d, nil
}

func (r *PostgresDepartamentoRepository) RemoverID(id int) error {
	response, err := r.db.Exec(context.Background(), "DELETE FROM departamentos WHERE id = $1", id)

	if err != nil {
		return err
	}
	if response.RowsAffected() == 0 {
		return errors.New("Setor não encontrado")
	}
	return nil
}

func (r *PostgresDepartamentoRepository) Atualizar(departamento *models.Departamento) (*models.Departamento, error) {
	response, err := r.db.Exec(
		context.Background(),
		"UPDATE departamentos SET nome = $1 WHERE id = $2",
		departamento.Nome,
		departamento.ID,
	)

	if err != nil {
		return nil, err
	}
	if response.RowsAffected() == 0 {
		return nil, errors.New("Departamento não encontrado")
	}

	return departamento, nil
}

func (r *PostgresDepartamentoRepository) Listar() ([]*models.Departamento, error) {
	rows, err := r.db.Query(context.Background(), `
		SELECT id, nome, loja_id
		FROM departamentos
		ORDER BY LOWER(TRIM(nome));
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	lista := []*models.Departamento{}

	for rows.Next() {
		departamento := &models.Departamento{}
		if err := rows.Scan(
			&departamento.ID,
			&departamento.Nome,
			&departamento.LojaID,
		); err != nil {
			return nil, err
		}
		lista = append(lista, departamento)
	}

	return lista, nil
}

func (r *PostgresDepartamentoRepository) ListarPorLoja(lojaID int) ([]*models.Departamento, error) {
	if lojaID <= 0 {
		return nil, errors.New("loja inválida")
	}
	rows, err := r.db.Query(context.Background(), `
		SELECT id, nome, loja_id
		FROM departamentos
		WHERE loja_id = $1
		ORDER BY LOWER(TRIM(nome));
	`, lojaID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	lista := []*models.Departamento{}

	for rows.Next() {
		departamento := &models.Departamento{}
		if err := rows.Scan(
			&departamento.ID,
			&departamento.Nome,
			&departamento.LojaID,
		); err != nil {
			return nil, err
		}
		lista = append(lista, departamento)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return lista, nil
}

func (r *PostgresDepartamentoRepository) BuscarID(id int) (*models.Departamento, error) {
	departamento := &models.Departamento{}

	row := r.db.QueryRow(context.Background(), "SELECT id, nome, loja_id FROM departamentos WHERE id = $1;", id)

	err := row.Scan(
		&departamento.ID,
		&departamento.Nome,
		&departamento.LojaID,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, errors.New("departamento não encontrado")
	}
	if err != nil {
		return nil, err
	}

	return departamento, nil
}
