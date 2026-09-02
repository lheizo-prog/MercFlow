package produtodepartamento

import (
	"MercFlow/internal/models"
)

type ProdutoDepartamentoRepository interface {
	Criar(produto *models.ProdutoDepartamento) (*models.ProdutoDepartamento, error)
	RemoverID(id int) error
	BuscarID(id int) (*models.ProdutoDepartamento, error)
	BuscarCodigo(codigo string) (*models.ProdutoDepartamento, error)
	BuscarInativo(departamentoID, produtoGenericoID int, codigo string) (*models.ProdutoDepartamento, error)
	Reativar(id int) error
	Atualizar(produto *models.ProdutoDepartamento) (*models.ProdutoDepartamento, error)
	Listar() ([]*models.ProdutoDepartamento, error)
}
