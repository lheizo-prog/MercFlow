package lancamento

import "MercFlow/internal/models"

type LancamentoRepository interface{
	Criar(lancamento *models.Lancamento) (*models.Lancamento, error)
	BuscarID(id int) (*models.Lancamento, error)
	Listar() ([]models.Lancamento, error)
}