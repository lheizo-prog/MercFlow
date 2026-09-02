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

func NovoDepartamentoService(repo repository.DepartamentoRepository) *DepartamentoService {
	return &DepartamentoService{
		repo: repo,
	}
}

func (s *DepartamentoService) Criar(d *models.Departamento, lojas ...int) (*models.Departamento, error) {
	if d != nil {
		d.LojaID = lojaSolicitada(lojas)
	}
	if s.ValidarDepartamento(d) != nil {
		return nil, s.ValidarDepartamento(d)
	}

	return s.repo.Criar(d)
}

func (s *DepartamentoService) RemoverID(id int, lojas ...int) error {
	if id <= 0 {
		return errors.New("ID inválido")
	}

	recurso, err := s.repo.BuscarID(id)
	if err != nil || !pertenceALoja(lojaSolicitada(lojas), recurso.LojaID) {
		return erroAcessoLoja()
	}
	return s.repo.RemoverID(id)
}

func (s *DepartamentoService) Atualizar(d *models.Departamento, lojas ...int) (*models.Departamento, error) {
	if s.ValidarDepartamento(d) != nil {
		return nil, s.ValidarDepartamento(d)
	}
	recurso, err := s.repo.BuscarID(d.ID)
	if err != nil || !pertenceALoja(lojaSolicitada(lojas), recurso.LojaID) {
		return nil, erroAcessoLoja()
	}
	return s.repo.Atualizar(d)
}

func (s *DepartamentoService) Listar(lojas ...int) ([]*models.Departamento, error) {
	departamentos, err := s.repo.Listar()

	if err != nil {
		return nil, err
	}
	lojaID := lojaSolicitada(lojas)
	if lojaID <= 0 {
		return departamentos, nil
	}
	filtrados := make([]*models.Departamento, 0, len(departamentos))
	for _, departamento := range departamentos {
		if departamento.LojaID == lojaID {
			filtrados = append(filtrados, departamento)
		}
	}
	return filtrados, nil
}

func (s *DepartamentoService) BuscarID(id int, lojas ...int) (*models.Departamento, error) {
	departamento, err := s.repo.BuscarID(id)

	if err != nil {
		return nil, err
	}
	if !pertenceALoja(lojaSolicitada(lojas), departamento.LojaID) {
		return nil, erroAcessoLoja()
	}
	return departamento, nil
}

func (s *DepartamentoService) ValidarDepartamento(d *models.Departamento) error {
	if strings.TrimSpace(d.Nome) == "" {
		return errors.New("Nome do departamento é obirgatório")
	}
	if d == nil {
		return errors.New("Departamento inválido")
	}
	return nil
}
