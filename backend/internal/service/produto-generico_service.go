package service

import (
	"MercFlow/internal/models"
	repository "MercFlow/internal/repository/produto-generico"
	"errors"
	"strings"
)

type ProdutoService struct {
	repo repository.ProdutoGenericoRepository
}

func NovoProdutoService(repo repository.ProdutoGenericoRepository) *ProdutoService {
	return &ProdutoService{
		repo: repo,
	}
}

func (s *ProdutoService) Criar(p *models.ProdutoGenerico, lojas ...int) (*models.ProdutoGenerico, error) {
	if p != nil {
		p.LojaID = lojaSolicitada(lojas)
	}
	if err := s.ValidarProduto(p); err != nil {
		return nil, err
	}
	return s.repo.Criar(p)
}

func (s *ProdutoService) Atualizar(p *models.ProdutoGenerico, lojas ...int) (*models.ProdutoGenerico, error) {
	if err := s.ValidarProduto(p); err != nil {
		return nil, err
	}
	atual, err := s.repo.BuscarID(p.ID)
	if err != nil || !pertenceALoja(lojaSolicitada(lojas), atual.LojaID) {
		return nil, erroAcessoLoja()
	}
	return s.repo.Atualizar(p)
}

func (s *ProdutoService) RemoverID(id int, lojas ...int) error {
	if id <= 0 {
		return errors.New("ID inválido")
	}

	produto, err := s.repo.BuscarID(id)
	if err != nil || !pertenceALoja(lojaSolicitada(lojas), produto.LojaID) {
		return erroAcessoLoja()
	}
	return s.repo.RemoverID(id)
}

func (s *ProdutoService) Listar(lojas ...int) ([]*models.ProdutoGenerico, error) {
	produtos, err := s.repo.Listar()
	if err != nil {
		return nil, err
	}
	lojaID := lojaSolicitada(lojas)
	if lojaID <= 0 {
		return produtos, nil
	}
	filtrados := make([]*models.ProdutoGenerico, 0, len(produtos))
	for _, produto := range produtos {
		if produto.LojaID == lojaID {
			filtrados = append(filtrados, produto)
		}
	}
	return filtrados, nil
}

func (s *ProdutoService) BuscarID(id int, lojas ...int) (*models.ProdutoGenerico, error) {
	produto, err := s.repo.BuscarID(id)
	if err != nil {
		return nil, err
	}
	if !pertenceALoja(lojaSolicitada(lojas), produto.LojaID) {
		return nil, erroAcessoLoja()
	}
	return produto, nil
}

func (s *ProdutoService) BuscarCodigo(codigo string, lojas ...int) (*models.ProdutoGenerico, error) {
	produto, err := s.repo.BuscarCodigo(codigo)
	if err != nil {
		return nil, err
	}
	if !pertenceALoja(lojaSolicitada(lojas), produto.LojaID) {
		return nil, erroAcessoLoja()
	}
	return produto, nil
}

func (s *ProdutoService) ValidarProduto(p *models.ProdutoGenerico) error {
	if p == nil {
		return errors.New("produto inválido")
	}

	if strings.TrimSpace(p.Nome) == "" {
		return errors.New("nome do produto é obrigatório")
	}
	if strings.TrimSpace(p.Codigo_Geral) == "" {
		return errors.New("código do produto é obrigatório")
	}

	return nil
}
