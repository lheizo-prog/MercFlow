package repository

import (
	"MercFlow/internal/models"
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

type PostgresProdutoRepository struct {
	db *pgxpool.Pool
}

func NovoPostgresProdutoRepository(db *pgxpool.Pool) *PostgresProdutoRepository{
	return &PostgresProdutoRepository{
		db: db,
	}
}

func (r *PostgresProdutoRepository)Adicionar(p *models.Produto) (*models.Produto, error){

	err := r.db.QueryRow(context.Background(), "INSERT INTO produtos (nome, codigo) VALUES ($1, $2) RETURNING id", p.Nome, p.Codigo_Geral).Scan(&p.ID)

	if err != nil{
		return nil, err
	}
	return p, nil
}

func (r *PostgresProdutoRepository)RemoverID(id int) error{
	return nil
}
func (r *PostgresProdutoRepository)BuscarProdutoID(id int) (*models.Produto, error){
	return nil, nil
}
func (r *PostgresProdutoRepository)BuscarProdutoCodigo(codigo string) (*models.Produto, error){
	return nil, nil
}
func (r *PostgresProdutoRepository)Atualizar(produto *models.Produto) error{
	return nil
}
func (r *PostgresProdutoRepository)Listar() ([]*models.Produto, error){
	return nil, nil
}