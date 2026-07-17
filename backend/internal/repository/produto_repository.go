package repository

import (
	"MercFlow/internal/models"
)

type ProdutoRepository interface{
	Adicionar(produto *models.Produto) (*models.Produto, error)
	RemoverID(id int) error
	BuscarID(id int) (*models.Produto, error)
	BuscarCodigo(codigo string) (*models.Produto, error)
	Atualizar(produto *models.Produto) error
	Listar() ([]*models.Produto, error)
}
