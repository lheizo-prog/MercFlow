package produtodepartamento

import (
	"MercFlow/internal/models"
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type PostgresProdutoDepartamentoRepository struct{
	db *pgxpool.Pool
}

func NovoPostgresProdutoDepartamentoRepository(db *pgxpool.Pool) *PostgresProdutoDepartamentoRepository{
	return &PostgresProdutoDepartamentoRepository{
		db: db,
	}
}

func (r *PostgresProdutoDepartamentoRepository)Criar(p *models.ProdutoDepartamento) (*models.ProdutoDepartamento, error){
	err := r.db.QueryRow(
		context.Background(),
		"INSERT INTO produtos_departamento (produto_base_id, departamento_id, nome, codigo, unidade_medida, fator_conversao, ativo ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id",
		p.ProdutoBaseID,
		p.DepartamentoID,
		p.Nome,
		p.Codigo,
		p.UnidadeMedida,
		p.FatorConversao,
		p.Ativo,
	).Scan(&p.ID)
	if err != nil{
		return nil, err
	}
	return p, nil
}

func (r *PostgresProdutoDepartamentoRepository)RemoverID(id int) error{
	reponse, err := r.db.Exec(
		context.Background(), 
		"UPDATE produtos_departamento SET ativo = FALSE WHERE id = $1", 
		id,
	)
	if err != nil{
		return err
	}
	if reponse.RowsAffected() == 0{
		return errors.New("produto não encontrado")
	}
	return nil
}

func (r *PostgresProdutoDepartamentoRepository)Atualizar(p *models.ProdutoDepartamento) (*models.ProdutoDepartamento, error){
	response, err := r.db.Exec(
		context.Background(),
		"UPDATE produtos_departamento SET produto_base_id = $1, departamento_id = $2, nome = $3, codigo = $4, unidade_medida = $5, fator_conversao = $6, ativo = $7 WHERE id = $8",
		p.ProdutoBaseID,
		p.DepartamentoID,
		p.Nome,
		p.Codigo,
		p.UnidadeMedida,
		p.FatorConversao,
		p.Ativo,
		p.ID,
	)
	if err != nil{
		return nil, err
	}

	if response.RowsAffected() == 0 {
		return nil, errors.New("produto não encontrado")
	}

	return p, nil
}

func (r *PostgresProdutoDepartamentoRepository)Listar() ([]*models.ProdutoDepartamento, error){
	rows, err := r.db.Query(
		context.Background(),
		"SELECT id, produto_base_id, departamento_id, nome, codigo, unidade_medida, fator_conversao, ativo FROM produtos_departamento WHERE ativo = TRUE",
	)
	if err != nil{
		return nil, err
	}
	defer rows.Close()

	lista := []*models.ProdutoDepartamento{}

	for rows.Next() {
		produto := &models.ProdutoDepartamento{}
		if err:= rows.Scan(
			&produto.ID,
			&produto.ProdutoBaseID,
			&produto.DepartamentoID,
			&produto.Nome,
			&produto.Codigo,	
			&produto.UnidadeMedida,
			&produto.FatorConversao,
			&produto.Ativo,
		); err != nil{
			return nil, err
		}
		lista = append(lista, produto)
	}
	if err := rows.Err(); err != nil{
		return nil, err
	}

	return lista, nil
}

func (r *PostgresProdutoDepartamentoRepository)BuscarID(id int) (*models.ProdutoDepartamento, error){
	produto := &models.ProdutoDepartamento{}

	row := r.db.QueryRow(
		context.Background(),
		"SELECT id, produto_base_id, departamento_id, nome, codigo, unidade_medida, fator_conversao, ativo FROM produtos_departamento WHERE ativo = TRUE AND id = $1",
		id,
	)

	err := row.Scan(
		&produto.ID,
		&produto.ProdutoBaseID,
		&produto.DepartamentoID,
		&produto.Nome,
		&produto.Codigo,
		&produto.UnidadeMedida,
		&produto.FatorConversao,
		&produto.Ativo,
	)
	if errors.Is(err, pgx.ErrNoRows){
		return nil, errors.New("produto não encontrado")
	}

	if err != nil{
		return nil, err
	}

	return produto, nil
}
func (r *PostgresProdutoDepartamentoRepository)BuscarCodigo(codigo string) (*models.ProdutoDepartamento, error){
	produto := &models.ProdutoDepartamento{}

	row := r.db.QueryRow(
		context.Background(),
		"SELECT id, produto_base_id, departamento_id, nome, codigo, unidade_medida, fator_conversao, ativo FROM produtos_departamento WHERE ativo = TRUE AND codigo = $1",
		codigo,
	)

	err := row.Scan(
		&produto.ID,
		&produto.ProdutoBaseID,
		&produto.DepartamentoID,
		&produto.Nome,
		&produto.Codigo,
		&produto.UnidadeMedida,
		&produto.FatorConversao,
		&produto.Ativo,
	)
	if errors.Is(err, pgx.ErrNoRows){
		return nil, errors.New("produto não encontrado")
	}

	if err != nil{
		return nil, err
	}

	return produto, nil
}