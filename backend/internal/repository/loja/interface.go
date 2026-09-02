package loja

import "MercFlow/internal/models"

type LojaRepository interface {
	Criar(loja *models.Loja) (*models.Loja, error)
	Listar() ([]*models.Loja, error)
}
