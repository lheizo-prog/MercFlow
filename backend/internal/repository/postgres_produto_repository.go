package repository

import (
	"MercFlow/internal/models"
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
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
	response, err := r.db.Exec(context.Background(), "DELETE FROM produtos WHERE id = $1",id)

	if err != nil{
		return err
	}
	if response.RowsAffected() == 0{
		return errors.New("Produto não encontrado")
	}
	return nil
}
func (r *PostgresProdutoRepository)BuscarProdutoID(id int) (*models.Produto, error){
	return nil, nil
}
func (r *PostgresProdutoRepository)Atualizar(p *models.Produto) (*models.Produto, error){
	response, err := r.db.Exec(context.Background(), "UPDATE produtos SET nome = $1, codigo = $2 WHERE id = $3",p.Nome, p.Codigo_Geral, p.ID)

	if err != nil {
		return nil, err
	}
	if response.RowsAffected() == 0{
		return nil, errors.New("Produto não encontrado")
	}
	return p, nil
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

func (r *PostgresProdutoRepository)BuscarID(id int) (*models.Produto, error){
	produto := &models.Produto{}
	
	row := r.db.QueryRow(context.Background(), "SELECT id, nome, codigo FROM produtos WHERE id = $1;",id)
	
	err := row.Scan(
		&produto.ID,
		&produto.Nome,
		&produto.Codigo_Geral,
	)
	
	if errors.Is(err, pgx.ErrNoRows){
		return nil, errors.New("Produto não encontrado")
	}
	if err != nil{
		return nil, err
	}
	
	return produto, nil
}
func (r *PostgresProdutoRepository)BuscarCodigo(codigo string) (*models.Produto, error){
	produto := &models.Produto{}
	row := r.db.QueryRow(context.Background(), "SELECT id, nome, codigo FROM produtos WHERE codigo = $1",codigo)

	err := row.Scan(
		&produto.ID,
		&produto.Nome,
		&produto.Codigo_Geral,
	)

	if errors.Is(err, pgx.ErrNoRows){
		return nil, errors.New("Produto não encontrado")
	}
	if err != nil{
		return nil, err
	}

	return produto, nil
}