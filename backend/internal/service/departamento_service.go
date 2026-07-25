package service

import (
	"MercFlow/internal/models"
	repository "MercFlow/internal/repository/departamento"
	"errors"
	"strings"
)

type DepartamentoService struct {
	repo repository.DepartamentoRepository
}

func NovoDepartamentoService(repo repository.DepartamentoRepository) *DepartamentoService{
	return &DepartamentoService{
		repo: repo,
	}
}

func (s *DepartamentoService)Criar(d *models.Departamento) (*models.Departamento, error){
	if s.ValidarDepartamento(d) != nil{
		return nil, s.ValidarDepartamento(d)
	}

	return s.repo.Criar(d)
}

func (s *DepartamentoService)RemoverID(id int) error{
	if id <= 0 {
		return errors.New("ID inválido")
	}

	return s.repo.RemoverID(id)
}

func (s *DepartamentoService)Atualizar(d *models.Departamento) (*models.Departamento, error){
	if s.ValidarDepartamento(d) != nil{
		return nil, s.ValidarDepartamento(d)
	}
	return s.repo.Atualizar(d)
}

func (s *DepartamentoService)Listar() ([]*models.Departamento, error){
	departamentos, err := s.repo.Listar()
	
	if err != nil{
		return nil, err
	}
	return departamentos, nil
}

func (s *DepartamentoService)BuscarID(id int) (*models.Departamento, error){
	departamento, err := s.repo.BuscarID(id)

	if err != nil{
		return nil, err
	}
	return departamento, nil
}


func (s *DepartamentoService)ValidarDepartamento(d *models.Departamento) error{
	if strings.TrimSpace(d.Nome) == ""{
		return errors.New("Nome do departamento é obirgatório")
	}
	if d == nil{
		return errors.New("Departamento inválido")
	}
	return nil
}