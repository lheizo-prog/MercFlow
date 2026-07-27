package produtodepartamento

import (
	"MercFlow/internal/models"

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
	return nil, nil
}

func (r *PostgresProdutoDepartamentoRepository)RemoverID(id int) error{
	return nil
}