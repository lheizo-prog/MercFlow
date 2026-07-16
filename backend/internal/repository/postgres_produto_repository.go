package repository

import (
	"MercFlow/internal/models"
	"context"
	"fmt"

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
	fmt.Println(">>> Entrou em Adicionar()")
	fmt.Printf("Pool: %p\n",r.db)

	err := r.db.QueryRow(context.Background(), "INSERT INTO produtos (nome, codigo) VALUES ($1, $2) RETURNING id", p.Nome, p.Codigo_Geral).Scan(&p.ID)

	fmt.Println(">>> Query executada")
	fmt.Printf("Erro:", err)

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
	rows, err := r.db.Query(context.Background(), "SELECT id, nome, codigo FROM produtos ORDER BY nome;")
	if err != nil{
		return nil, err
	}
	defer rows.Close()

	var lista []*models.Produto

	for rows.Next() {
		produto := &models.Produto{}
		rows.Scan(
			&produto.ID,
			&produto.Nome,
			&produto.Codigo_Geral,
		)
		lista = append(lista, produto)
	}


	return lista, nil
}