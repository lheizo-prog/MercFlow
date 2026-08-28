package departamento

import (
	"MercFlow/internal/models"
	"context"
	"errors"

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
	err := r.db.QueryRow(context.Background(), "INSERT INTO departamentos (nome) VALUES ($1) RETURNING id", d.Nome).Scan(&d.ID)

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
		SELECT d.id, d.nome
		FROM departamentos d
		LEFT JOIN lancamentos l ON l.departamento_id = d.id
		WHERE d.id = (
			SELECT d2.id
			FROM departamentos d2
			LEFT JOIN lancamentos l2 ON l2.departamento_id = d2.id
			WHERE LOWER(TRIM(d2.nome)) = LOWER(TRIM(d.nome))
			GROUP BY d2.id
			ORDER BY COUNT(l2.id) DESC, d2.id
			LIMIT 1
		)
		GROUP BY d.id, d.nome
		ORDER BY LOWER(TRIM(d.nome));
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	lista := []*models.Departamento{}

	for rows.Next() {
		departamento := &models.Departamento{}
		rows.Scan(
			&departamento.ID,
			&departamento.Nome,
		)
		lista = append(lista, departamento)
	}

	return lista, nil
}

func (r *PostgresDepartamentoRepository) BuscarID(id int) (*models.Departamento, error) {
	departamento := &models.Departamento{}

	row := r.db.QueryRow(context.Background(), "SELECT id, nome FROM departamentos WHERE id = $1;", id)

	err := row.Scan(
		&departamento.ID,
		&departamento.Nome,
	)
	if err != nil {
		return nil, err
	}

	return departamento, nil
}
