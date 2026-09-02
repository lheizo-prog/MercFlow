package produtodepartamento

import (
	"MercFlow/internal/models"
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type PostgresProdutoDepartamentoRepository struct {
	db *pgxpool.Pool
}

func NovoPostgresProdutoDepartamentoRepository(db *pgxpool.Pool) *PostgresProdutoDepartamentoRepository {
	return &PostgresProdutoDepartamentoRepository{
		db: db,
	}
}

func (r *PostgresProdutoDepartamentoRepository) Criar(p *models.ProdutoDepartamento) (*models.ProdutoDepartamento, error) {
	err := r.db.QueryRow(
		context.Background(),
		"INSERT INTO produtos_departamento (produto_generico_id, departamento_id, nome, codigo, unidade_medida, loja_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, ativo",
		p.ProdutoGenericoID,
		p.DepartamentoID,
		p.Nome,
		p.Codigo,
		p.UnidadeMedida,
		p.LojaID,
	).Scan(&p.ID, &p.Ativo)
	if err != nil {
		fmt.Println("Erro ao criar produto departamento:", err)
		return nil, err
	}
	return p, nil
}

func (r *PostgresProdutoDepartamentoRepository) RemoverID(id int) error {
	reponse, err := r.db.Exec(
		context.Background(),
		"UPDATE produtos_departamento SET ativo = FALSE WHERE id = $1",
		id,
	)
	if err != nil {
		return err
	}
	if reponse.RowsAffected() == 0 {
		return errors.New("produto não encontrado")
	}
	return nil
}

func (r *PostgresProdutoDepartamentoRepository) Atualizar(p *models.ProdutoDepartamento) (*models.ProdutoDepartamento, error) {
	response, err := r.db.Exec(
		context.Background(),
		"UPDATE produtos_departamento SET produto_generico_id = $1, departamento_id = $2, nome = $3, codigo = $4, unidade_medida = $5, ativo = $6 WHERE id = $7",
		p.ProdutoGenericoID,
		p.DepartamentoID,
		p.Nome,
		p.Codigo,
		p.UnidadeMedida,
		p.Ativo,
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

func (r *PostgresProdutoDepartamentoRepository) Listar() ([]*models.ProdutoDepartamento, error) {
	rows, err := r.db.Query(
		context.Background(),
		"SELECT pd.id, pd.loja_id, pd.produto_generico_id, pg.nome, pd.departamento_id, d.nome, pd.nome, pd.codigo, pd.unidade_medida, pd.ativo FROM produtos_departamento pd INNER JOIN produtos_genericos pg ON pg.id = pd.produto_generico_id INNER JOIN departamentos d ON d.id = pd.departamento_id WHERE pd.ativo = TRUE",
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	lista := []*models.ProdutoDepartamento{}

	for rows.Next() {
		produto := &models.ProdutoDepartamento{}
		if err := rows.Scan(
			&produto.ID,
			&produto.LojaID,
			&produto.ProdutoGenericoID,
			&produto.ProdutoGenericoNome,
			&produto.DepartamentoID,
			&produto.DepartamentoNome,
			&produto.Nome,
			&produto.Codigo,
			&produto.UnidadeMedida,
			&produto.Ativo,
		); err != nil {
			return nil, err
		}
		lista = append(lista, produto)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return lista, nil
}

func (r *PostgresProdutoDepartamentoRepository) BuscarID(id int) (*models.ProdutoDepartamento, error) {
	produto := &models.ProdutoDepartamento{}

	row := r.db.QueryRow(
		context.Background(),
		"SELECT pd.id, pd.loja_id, pd.produto_generico_id, pg.nome, pd.departamento_id, d.nome, pd.nome, pd.codigo, pd.unidade_medida, pd.ativo FROM produtos_departamento pd INNER JOIN produtos_genericos pg ON pg.id = pd.produto_generico_id INNER JOIN departamentos d ON d.id = pd.departamento_id WHERE pd.ativo = TRUE AND pd.id = $1;",
		id,
	)

	err := row.Scan(
		&produto.ID,
		&produto.LojaID,
		&produto.ProdutoGenericoID,
		&produto.ProdutoGenericoNome,
		&produto.DepartamentoID,
		&produto.DepartamentoNome,
		&produto.Nome,
		&produto.Codigo,
		&produto.UnidadeMedida,
		&produto.Ativo,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, errors.New("produto não encontrado")
	}

	if err != nil {
		return nil, err
	}

	return produto, nil
}
func (r *PostgresProdutoDepartamentoRepository) BuscarCodigo(codigo string) (*models.ProdutoDepartamento, error) {
	produto := &models.ProdutoDepartamento{}

	row := r.db.QueryRow(
		context.Background(),
		"SELECT pd.id, pd.loja_id, pd.produto_generico_id, pg.nome, pd.departamento_id, d.nome, pd.nome, pd.codigo, pd.unidade_medida, pd.ativo FROM produtos_departamento pd INNER JOIN produtos_genericos pg ON pg.id = pd.produto_generico_id INNER JOIN departamentos d ON d.id = pd.departamento_id WHERE pd.ativo = TRUE AND pd.codigo = $1;",
		codigo,
	)

	err := row.Scan(
		&produto.ID,
		&produto.LojaID,
		&produto.ProdutoGenericoID,
		&produto.ProdutoGenericoNome,
		&produto.DepartamentoID,
		&produto.DepartamentoNome,
		&produto.Nome,
		&produto.Codigo,
		&produto.UnidadeMedida,
		&produto.Ativo,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, errors.New("produto não encontrado")
	}

	if err != nil {
		return nil, err
	}

	return produto, nil
}

func (r *PostgresProdutoDepartamentoRepository) BuscarInativo(produtoGenericoID, departamentoID int, codigo string) (*models.ProdutoDepartamento, error) {
	produto := &models.ProdutoDepartamento{}

	fmt.Println(departamentoID, produtoGenericoID, codigo)

	row := r.db.QueryRow(
		context.Background(),
		"SELECT id, loja_id, produto_generico_id, departamento_id, nome, codigo, unidade_medida, ativo FROM produtos_departamento WHERE ativo = FALSE AND produto_generico_id = $1 AND departamento_id = $2 AND codigo = $3",
		produtoGenericoID,
		departamentoID,
		codigo,
	)

	err := row.Scan(
		&produto.ID,
		&produto.LojaID,
		&produto.ProdutoGenericoID,
		&produto.DepartamentoID,
		&produto.Nome,
		&produto.Codigo,
		&produto.UnidadeMedida,
		&produto.Ativo,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, errors.New("produto não encontrado")
	}
	if err != nil {
		return nil, err
	}

	fmt.Println("produto encontrado", produto)
	return produto, nil
}

func (r *PostgresProdutoDepartamentoRepository) Reativar(id int) error {
	response, err := r.db.Exec(
		context.Background(),
		"UPDATE produtos_departamento SET ativo = TRUE WHERE id = $1",
		id,
	)
	if err != nil {
		return err
	}
	if response.RowsAffected() == 0 {
		return errors.New("produto não encontrado")
	}

	return nil
}
