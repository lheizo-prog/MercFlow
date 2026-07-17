package service

import (
	"MercFlow/internal/models"
	"MercFlow/internal/repository"
	"errors"
	"strings"
)

type ProdutoService struct {
	repo repository.ProdutoRepository
}

func NovoProdutoService(r repository.ProdutoRepository) *ProdutoService{
	return &ProdutoService{
		repo: r,
	}
}

func (s *ProdutoService) Criar(p *models.Produto) (*models.Produto, error){
	if strings.TrimSpace(p.Nome) == ""{
		return nil, errors.New("Nome do produto é obrigatório")
	}
	if strings.TrimSpace(p.Codigo_Geral) == ""{
		return nil, errors.New("Código do produto é obrigatório")
	}
	if p == nil{
		return nil, errors.New("Produto inválido")
	}
	return s.repo.Adicionar(p)
}

func (s *ProdutoService) Listar() ([]*models.Produto, error){
	produtos, err := s.repo.Listar()
	if err != nil{
		return nil, err
	}
	return produtos, nil
}

func (s *ProdutoService) BuscarID(id int) (*models.Produto, error){
	produto, err := s.repo.BuscarID(id)
	if err != nil{
		return nil, err
	}
	return produto, nil
}

func (s *ProdutoService) BuscarCodigo(codigo string) (*models.Produto, error){
	produto, err := s.repo.BuscarCodigo(codigo)
	if err != nil{
		return nil, err
	}
	return produto, nil
}