package departamento

import "MercFlow/internal/models"

type MemoryDepartamentoRepository struct {
	setores []*models.Departamento
}

func NovoMemoryDepartamentoRepository() *MemoryDepartamentoRepository {
	return &MemoryDepartamentoRepository{}
}

func (r *MemoryDepartamentoRepository) Criar(d *models.Departamento) (*models.Departamento, error){
	r.setores = append(r.setores, d)
	return d, nil
}

func (r *MemoryDepartamentoRepository) RemoverID(id int) error{
	for i, p := range r.setores {
		if p.ID == id {
			r.setores = append(r.setores[:i], r.setores[i+1:]...)
		}
	}
	return nil
}

func (r *MemoryDepartamentoRepository) Atualizar(d *models.Departamento) (*models.Departamento, error){
	for i, p := range r.setores {
		if p.ID == d.ID {
			r.setores[i] = d
		}
	}
	return d, nil
}

func (r *MemoryDepartamentoRepository) BuscarID(id int) *models.Departamento {
	for _, p := range r.setores {
		if p.ID == id {
			return p
		}
	}
	return nil
}

func (r *MemoryDepartamentoRepository) Listar() []*models.Departamento {
	return r.setores
}