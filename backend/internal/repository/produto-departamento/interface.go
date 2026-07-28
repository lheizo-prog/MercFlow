package produtodepartamento

import (
	"MercFlow/internal/models"
)

type ProdutoDepartamentoRepository interface{
	Criar(produto *models.ProdutoDepartamento) (*models.ProdutoDepartamento, error)
	RemoverID(id int) error
	BuscarID(id int) (*models.ProdutoDepartamento, error)
	BuscarCodigo(codigo string) (*models.ProdutoDepartamento, error)
	Atualizar(produto *models.ProdutoDepartamento) (*models.ProdutoDepartamento, error)
	Listar() ([]*models.ProdutoDepartamento, error)
}