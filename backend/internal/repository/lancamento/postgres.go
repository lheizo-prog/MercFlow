package lancamento

import (
	"MercFlow/internal/models"
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

type LancamentoPostgresRepository struct {
	db *pgxpool.Pool
}

func NovoLancamentoPostgresRepositoy(db *pgxpool.Pool) *LancamentoPostgresRepository{
	return &LancamentoPostgresRepository{
		db: db,
	}
}

func (r *LancamentoPostgresRepository)Criar(lancamento *models.Lancamento) (*models.Lancamento, error){
	tx, err := r.db.Begin(context.Background())
	if err != nil{
		return nil, err
	}

	defer func() {
		if err != nil{
			_ = tx.Rollback(context.Background())
		}
	}()

	err = tx.QueryRow(
		context.Background(),
		`INSERT INTO lancamentos (tipo, departamento_id, observacao) VALUES ($1, $2, $3) RETURNING id, data_lancamento`,
		lancamento.Tipo,
		lancamento.DepartamentoID,
		lancamento.Observacao,
	).Scan(
		&lancamento.ID,
		&lancamento.Data,
	)
	if err != nil{
		return nil, fmt.Errorf(
			"erro ao criar lançamento, %w",
			err,
		)
	}
	
	for i := range lancamento.Itens {
		item := &lancamento.Itens[i]

		err = tx.QueryRow(
			context.Background(),
			`INSERT INTO lancamento_itens (lancamento_id, produto_mercearia_id, produto_departamento_id, quantidade) VALUES ($1, $2, $3, $4) RETURNING id`,
			lancamento.ID,
			item.ProdutoMerceariaID,
			item.ProdutoDepartamentoID,
			item.Quantidade,
		).Scan(
			&item.ID,
		)
		if err != nil{
			return nil, fmt.Errorf(
				"erro ao criar item do lancamento: %w",
				err,
			)
		}
		item.LancamentoID = lancamento.ID
	}
	if err := tx.Commit(context.Background()); err != nil{
		return nil, fmt.Errorf(
			"erro ao confirmar lançamento: %w",
			err,
		)
	}

	return lancamento, nil
}

func (r *LancamentoPostgresRepository)BuscarID(id int) (*models.Lancamento, error){
	lancamento := &models.Lancamento{}

	err := r.db.QueryRow(
		context.Background(),
		`SELECT id, tipo, departamento_id, data_lancamento, observacao FROM lancamentos WHERE id = $1`,
		id,
	).Scan(
		&lancamento.ID,
		&lancamento.Tipo,
		&lancamento.DepartamentoID,
		&lancamento.Data,
		&lancamento.Observacao,
	)
	if err != nil{
		return nil, errors.New("lançamento não encontrado")
	}

	rows, err := r.db.Query(
		context.Background(),
		`SELECT id, lancamento_id, produto_mercearia_id, produto_departamento_id, quantidade FROM lancamento_itens WHERE lancamento_id = $1 ORDER BY id`,
		lancamento.ID,
	)
	if err != nil{
		return nil, err
	}

	defer rows.Close()
	
	for rows.Next() {
		var item models.LancamentoItem

		err := rows.Scan(
			&item.ID,
			&item.LancamentoID,
			&item.ProdutoMerceariaID,
			&item.ProdutoDepartamentoID,
			&item.Quantidade,
		)
		if err != nil{
			 return nil, err
		}

		lancamento.Itens = append(lancamento.Itens, item)
	}
	if err := rows.Err(); err != nil{
		return nil, err
	}

	return lancamento, nil
}

func (r *LancamentoPostgresRepository)Listar() ([]models.Lancamento, error){
	rows, err := r.db.Query(
		context.Background(),
		`SELECT id, tipo, departamento_id, data_lancamento, observacao FROM lancamentos ORDER BY data_lancamento DESC`,
	)	
	if err != nil{
		return nil, err
	}

	defer rows.Close()

	var lancamentos []models.Lancamento

	for rows.Next(){
		var lancamento models.Lancamento

		err := rows.Scan(
			&lancamento.ID,
			&lancamento.Tipo,
			&lancamento.DepartamentoID,
			&lancamento.Data,
			&lancamento.Observacao,
		)
		if err != nil{
			return nil, err
		}

		lancamentos = append(lancamentos, lancamento)
	}
	if err := rows.Err(); err != nil{
		return nil, err
	}

	return lancamentos, nil
}