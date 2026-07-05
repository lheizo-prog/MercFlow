package service

import (
	"MercFlow/internal/models"
	"MercFlow/internal/repository"

	"errors"
)

type DepartamentoService struct {
	repository *repository.MemoryDepartamentoRepository
}

func NovoDepartamentoService(repo *repository.MemoryDepartamentoRepository) *DepartamentoService{
	return &DepartamentoService{
		repository: repo,
	}
}

func (s *DepartamentoService)CriarDepartamento(id int, nome string) error{
	if id <= 0 || nome == ""{
		return errors.New("Parâmetro(s) inválido(s).")
	}
	_, err := s.BuscarID(id)

	if err != nil{
		return err
	}

	models.CriarDepartamento(id, nome)
	return nil
}

func (s *DepartamentoService)Adicionar(d *models.Departamento) error{
	if s.repository.BuscarID(d.ID) != nil{
		return errors.New("Já há um setor com o reespectivo ID.")
	}
	s.repository.Adicionar(d)
	return nil
}

func (s *DepartamentoService)RemoverID(id int) error{
	if s.repository.BuscarID(id) == nil {
		return errors.New("Não foi possível encontrar  um produto com o reespectivo ID.")
	}
	s.repository.RemoverID(id)
	return nil
}

func (s *DepartamentoService)Atualizar(d *models.Departamento) error{
	if s.repository.BuscarID(d.ID) == nil{
		return errors.New("Não foi possível encontrar algum produto com o reespectivo ID.")
	}
	s.repository.Atualizar(d)
	return nil
}

func (s *DepartamentoService)BuscarID(id int) (*models.Departamento, error){
	if s.repository.BuscarID(id) != nil{
		return s.repository.BuscarID(id), nil
	}
	return nil, errors.New("ID do setor não foi encontrado.")
}

func (s *DepartamentoService)Listar() ([]*models.Departamento, error){
	setores := s.repository.Listar()
	if len(setores) == 0{
		return nil, errors.New("Não há elementos no repositório.")
	}
	return s.repository.Listar(), nil
}