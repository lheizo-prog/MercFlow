package produto_generico

import (
	"MercFlow/internal/models"
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type PostgresProdutoGenericoRepository struct {
	db *pgxpool.Pool
}

func NovoPostgresProdutoGenericoRepository(db *pgxpool.Pool) *PostgresProdutoGenericoRepository {
	return &PostgresProdutoGenericoRepository{
		db: db,
	}
}

func (r *PostgresProdutoGenericoRepository) Criar(p *models.ProdutoGenerico) (*models.ProdutoGenerico, error) {
	err := r.db.QueryRow(context.Background(), "INSERT INTO produtos_genericos (nome, codigo, loja_id) VALUES ($1, $2, $3) RETURNING id", p.Nome, p.Codigo_Geral, p.LojaID).Scan(&p.ID)

	if err != nil {
		return nil, err
	}
	return p, nil
}

func (r *PostgresProdutoGenericoRepository) RemoverID(id int) error {
	response, err := r.db.Exec(context.Background(), "DELETE FROM produtos_genericos WHERE id = $1", id)

	if err != nil {
		return err
	}
	if response.RowsAffected() == 0 {
		return errors.New("Produto não encontrado")
	}
	return nil
}
func (r *PostgresProdutoGenericoRepository) Atualizar(p *models.ProdutoGenerico) (*models.ProdutoGenerico, error) {
	response, err := r.db.Exec(
		context.Background(),
		"UPDATE produtos_genericos SET nome = $1, codigo = $2 WHERE id = $3",
		p.Nome,
		p.Codigo_Geral,
		p.ID,
	)

	if err != nil {
		return nil, err
	}

	if response.RowsAffected() == 0 {
		return nil, errors.New("produto não encontrado")
	}

	return p, nil
}
func (r *PostgresProdutoGenericoRepository) Listar() ([]*models.ProdutoGenerico, error) {
	rows, err := r.db.Query(context.Background(), "SELECT id, nome, codigo, loja_id FROM produtos_genericos ORDER BY nome;")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	lista := []*models.ProdutoGenerico{}

	for rows.Next() {
		produto := &models.ProdutoGenerico{}
		rows.Scan(
			&produto.ID,
			&produto.Nome,
			&produto.Codigo_Geral,
			&produto.LojaID,
		)
		lista = append(lista, produto)
	}

	return lista, nil
}

func (r *PostgresProdutoGenericoRepository) BuscarID(id int) (*models.ProdutoGenerico, error) {
	produto := &models.ProdutoGenerico{}

	row := r.db.QueryRow(context.Background(), "SELECT id, nome, codigo, loja_id FROM produtos_genericos WHERE id = $1;", id)

	err := row.Scan(
		&produto.ID,
		&produto.Nome,
		&produto.Codigo_Geral,
		&produto.LojaID,
	)

	if errors.Is(err, pgx.ErrNoRows) {
		return nil, errors.New("produto não encontrado")
	}
	if err != nil {
		return nil, err
	}

	return produto, nil
}
func (r *PostgresProdutoGenericoRepository) BuscarCodigo(codigo string) (*models.ProdutoGenerico, error) {
	produto := &models.ProdutoGenerico{}
	row := r.db.QueryRow(context.Background(), "SELECT id, nome, codigo, loja_id FROM produtos_genericos WHERE codigo = $1", codigo)

	err := row.Scan(
		&produto.ID,
		&produto.Nome,
		&produto.Codigo_Geral,
		&produto.LojaID,
	)

	if errors.Is(err, pgx.ErrNoRows) {
		return nil, errors.New("Produto não encontrado")
	}
	if err != nil {
		return nil, err
	}

	return produto, nil
}
