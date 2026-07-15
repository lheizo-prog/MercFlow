package service

import (
	"MercFlow/repository"
)

type ProdutoService struct {
	repository *repository.PostgresProdutoRepository
}

func NovoProdutoService(r *repository.PostgresProdutoRepository) *ProdutoService{
	return &ProdutoService{
		repository: r,
	}
}

/*
func (s *ProdutoService)CriarProduto(id int, nome, codigo_geral string) error{
	if id <= 0 || nome == "" || codigo_geral == ""{
		return errors.New("Parâmetro(s) inválido(s)")
	}
	
	_, err := s.BuscarProdutoID(id)
	
	if err != nil{
		return err
		}

	_, err = s.BuscarProdutoCodigo(codigo_geral)

	if err != nil{
		return err
	}

	models.CriarProduto(id, nome, codigo_geral)
	return nil
}
func (s *ProdutoService) Adicionar(p *models.Produto) error{
	if s.repository.BuscarProdutoID(p.ID) != nil{
		return errors.New("Já há um produto com o reespectivo ID.")
	}
	if s.repository.BuscarProdutoCodigo(p.Codigo_Geral) != nil{
		return errors.New("Já há um produto com reespectivo código geral.")
	}
	s.repository.Adicionar(p)
	return nil
}

func (s *ProdutoService) RemoverID(id int) error{
	if s.repository.BuscarProdutoID(id) == nil{
		return errors.New("Não foi possível encontrar um produto com o reespectivo ID.")
	}
	s.repository.RemoverID(id)
	return nil
}

func (s *ProdutoService) BuscarProdutoID(id int) (*models.Produto, error){
	if s.repository.BuscarProdutoID(id) != nil{
		return s.repository.BuscarProdutoID(id), nil
	}
	return nil, errors.New("Não foi possível encontrar algum produto com o reespectivo ID.")
}

func (s *ProdutoService) BuscarProdutoCodigo(codigo string) (*models.Produto, error){
	if s.repository.BuscarProdutoCodigo(codigo) != nil{
		return s.repository.BuscarProdutoCodigo(codigo), nil
	}
	return nil, errors.New("Não foi possível enconrtrar algum produto com o reespectivo Código.")
}

func (s *ProdutoService) Atualizar(p *models.Produto) error{
	if s.repository.BuscarProdutoID(p.ID) == nil{
		return errors.New("Não foi possível encontrar algum produto com o reespectivo ID.")
	}
	s.repository.Atualizar(p)
	return nil
}

func (s *ProdutoService) Listar() ([]*models.Produto, error){
	produtos := s.repository.Listar()
	if len(produtos) == 0{
		return nil, errors.New("Não há produtos para listar")
	}
	return s.repository.Listar(), nil
}
	*/