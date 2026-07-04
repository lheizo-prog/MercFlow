package repository

import "MercFlow/internal/models"

type DepartamentoRepository interface {
	Adicionar(setor *models.Departamento)
	RemoverID(id int)
	Atualizar(setor *models.Departamento)
	BuscarID(id int) *models.Departamento
	Lista() []*models.Departamento
}

type MemoryDepartamentoRepository struct{
	setores []*models.Departamento
}

func NovoMemoryDepartamentoRepository() *MemoryDepartamentoRepository{
	return &MemoryDepartamentoRepository{}
}

func (r *MemoryDepartamentoRepository)Adicionar(d *models.Departamento){
	r.setores = append(r.setores, d)
}

func (r *MemoryDepartamentoRepository)RemoverID(id int) {
	for i, p := range r.setores{
		if p.ID == id{
			r.setores = append(r.setores[:i], r.setores[i+1:]...)
		}
	}
}

func (r *MemoryDepartamentoRepository)Atualizar(d *models.Departamento) {
	for i, p := range r.setores{
		if p.ID == d.ID{
			r.setores[i] = d
		}
	}
}

func (r *MemoryDepartamentoRepository)BuscarID(id int) *models.Departamento{
	for _, p := range r.setores{
		if p.ID == id{
			return p
		}
	}
	return nil
}

func (r *MemoryDepartamentoRepository)Listar() []*models.Departamento{
	return r.setores
}