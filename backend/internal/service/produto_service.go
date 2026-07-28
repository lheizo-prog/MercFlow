package service

import (
	"MercFlow/internal/models"
	repository "MercFlow/internal/repository/produto"
	"errors"
	"strings"
)

type ProdutoService struct {
	repo repository.ProdutoRepository
}

func NovoProdutoService(repo repository.ProdutoRepository) *ProdutoService{
	return &ProdutoService{
		repo: repo,
	}
}

func (s *ProdutoService) Criar(p *models.Produto) (*models.Produto, error){
	if err:=  s.ValidarProduto(p); err != nil{
		return nil, err
	}
	return s.repo.Criar(p)
}

func (s *ProdutoService)Atualizar(p *models.Produto) (*models.Produto, error){
	if err:=  s.ValidarProduto(p); err != nil{
		return nil, err
	}
	return s.repo.Atualizar(p)
}

func(s *ProdutoService)RemoverID(id int) error{
	if id <= 0{
		return errors.New("ID inválido")
	}
	
	return s.repo.RemoverID(id)
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

func (s *ProdutoService)ValidarProduto(p *models.Produto) error{
	if p == nil{
		return errors.New("produto inválido")
	}
	
	if strings.TrimSpace(p.Nome) == ""{
		return errors.New("nome do produto é obrigatório")
	}
	if strings.TrimSpace(p.Codigo_Geral) == ""{
		return errors.New("código do produto é obrigatório")
	}
	
	return nil
}