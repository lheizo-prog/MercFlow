package departamento

import "MercFlow/internal/models"

type DepartamentoRepository interface {
	Criar(d *models.Departamento) (*models.Departamento, error)
	RemoverID(id int) error
	Atualizar(departamento *models.Departamento) (*models.Departamento, error)
	Listar() ([]*models.Departamento, error)
	BuscarID(id int) (*models.Departamento, error)
}
