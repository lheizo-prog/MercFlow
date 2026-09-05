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
	if err := s.ValidarDepartamento(d); err != nil {
		return nil, err
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
	if err := s.ValidarDepartamento(d); err != nil {
		return nil, err
	}
	recurso, err := s.repo.BuscarID(d.ID)
	if err != nil || !pertenceALoja(lojaSolicitada(lojas), recurso.LojaID) {
		return nil, erroAcessoLoja()
	}
	return s.repo.Atualizar(d)
}

func (s *DepartamentoService) Listar(lojas ...int) ([]*models.Departamento, error) {
	lojaID := lojaSolicitada(lojas)
	if lojaID <= 0 {
		return s.repo.Listar()
	}
	return s.repo.ListarPorLoja(lojaID)
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
	if d == nil {
		return errors.New("departamento inválido")
	}
	if strings.TrimSpace(d.Nome) == "" {
		return errors.New("nome do departamento é obrigatório")
	}
	if d.LojaID <= 0 {
		return errors.New("loja não informada")
	}
	return nil
}
