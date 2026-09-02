package produtomercearia

import "MercFlow/internal/models"

type ProdutoMerceariaRepository interface {
	Criar(p *models.ProdutoMercearia) (*models.ProdutoMercearia, error)
	Atualizar(p *models.ProdutoMercearia) (*models.ProdutoMercearia, error)
	Listar() ([]*models.ProdutoMercearia, error)
	RemoverID(id int) error
	BuscarID(id int) (*models.ProdutoMercearia, error)
	BuscarSKU(sku string) (*models.ProdutoMercearia, error)
	BuscarCodigoBarras(codigoBarras string) (*models.ProdutoMercearia, error)
	Buscar(texto string) ([]*models.ProdutoMercearia, error)
	BuscarInativo(sku string) (*models.ProdutoMercearia, error)
	Reativar(id int) error
}
