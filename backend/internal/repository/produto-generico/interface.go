package produto_generico

import (
	"MercFlow/internal/models"
)

type ProdutoGenericoRepository interface {
	Criar(produto *models.ProdutoGenerico) (*models.ProdutoGenerico, error)
	RemoverID(id int) error
	BuscarID(id int) (*models.ProdutoGenerico, error)
	BuscarCodigo(codigo string) (*models.ProdutoGenerico, error)
	Atualizar(produto *models.ProdutoGenerico) (*models.ProdutoGenerico, error)
	Listar() ([]*models.ProdutoGenerico, error)
	ListarPorLoja(lojaID int) ([]*models.ProdutoGenerico, error)
}
