package service

import (
	"MercFlow/internal/models"
	"MercFlow/internal/repository/departamento"
	produtodepartamento "MercFlow/internal/repository/produto-departamento"
	produtogenerico "MercFlow/internal/repository/produto-generico"
	"errors"
	"fmt"
	"strings"
)

type ProdutoDepartamentoService struct{
	ProdutoDepartamentoRepo produtodepartamento.ProdutoDepartamentoRepository
	ProdutoRepo produtogenerico.ProdutoGenericoRepository
	DepartamentoRepo departamento.DepartamentoRepository
}

func NovoProdutoDepartamentoService(
	produtoDepartamentoRepo produtodepartamento.ProdutoDepartamentoRepository,
	produtoRepo produtogenerico.ProdutoGenericoRepository,
	departamentoRepo departamento.DepartamentoRepository,

	) *ProdutoDepartamentoService{
	return &ProdutoDepartamentoService{
		ProdutoDepartamentoRepo: produtoDepartamentoRepo,
		ProdutoRepo: produtoRepo,
		DepartamentoRepo: departamentoRepo,
	}
}

func (s *ProdutoDepartamentoService)Criar(p *models.ProdutoDepartamento) (*models.ProdutoDepartamento, error){
	fmt.Println("ENTROU NO CRIAR")
	fmt.Printf("Produto recebido: %+v\n", p)
	if err := s.ValidarProdutoD(p); err != nil{
		fmt.Println("ERRO VALIDAÇÃO", err)
		return nil, err
	}
	fmt.Println("PASSOU DA VALIDAÇÃO")
	res, err := s.ProdutoDepartamentoRepo.BuscarInativo(p.ProdutoGenericoID, p.DepartamentoID, p.Codigo)
	if err == nil{
		fmt.Println("ACHOU PRODUTO INATIVO, REATIVANDO")
		return nil,s.ProdutoDepartamentoRepo.Reativar(res.ID)
	}
	fmt.Println("VOLTOU DO BUSCAR INATIVO")
	fmt.Printf("Produto recebido: %+v\n", res)
	return s.ProdutoDepartamentoRepo.Criar(p)
}

func (s *ProdutoDepartamentoService)Atualizar(p *models.ProdutoDepartamento) (*models.ProdutoDepartamento, error){
	if err := s.ValidarProdutoD(p); err != nil{
		return nil, err
	}

	return s.ProdutoDepartamentoRepo.Atualizar(p)
}

func(s *ProdutoDepartamentoService)RemoverID(id int) error{
	if id <= 0{
		return errors.New("ID inválido")
	}

	return s.ProdutoDepartamentoRepo.RemoverID(id)
}

func (s *ProdutoDepartamentoService)Listar() ([]*models.ProdutoDepartamento, error){
	produtos, err := s.ProdutoDepartamentoRepo.Listar()
	if err != nil{
		return nil, err
	}

	return produtos, nil 
}

func (s *ProdutoDepartamentoService)BuscarID(id int) (*models.ProdutoDepartamento, error){
	produto, err := s.ProdutoDepartamentoRepo.BuscarID(id)
	if err != nil{
		return nil, err
	}
	
	return produto, nil
}

func (s *ProdutoDepartamentoService)BuscarCodigo(codigo string) (*models.ProdutoDepartamento, error){
	produto, err := s.ProdutoDepartamentoRepo.BuscarCodigo(codigo)
	if err != nil{
		return nil, err
	}

	return produto, nil
}

func(s *ProdutoDepartamentoService) ValidarProdutoD(p *models.ProdutoDepartamento) error{
	pS := s.ProdutoRepo
	dS := s.DepartamentoRepo

	if p == nil{
		return errors.New("produto inválido")
	}

	//Verificadores dos parâmetros do produto departamento
	if strings.TrimSpace(p.Nome) == ""{
		return errors.New("nome do produto é obrigatório")
	}
	if strings.TrimSpace(p.Codigo) == ""{
		return errors.New("código do produto é obrigatório")
	}
	if p.ProdutoGenericoID <= 0 || p.DepartamentoID <= 0{
		return errors.New("ID do produto genérico e/ou do departamento inválido(s)")
	}
	if !p.UnidadeMedida.Valido() {
		return errors.New("unidade de medida inválida")
	}

	//Verificador dos repositórios do produto genérico
	_, err := pS.BuscarID(p.ProdutoGenericoID)
	if err != nil{
		return errors.New("ID do produto genérico não encontrado")
	}

	//Verficador dos repositórios do departamento 
	_, err = dS.BuscarID(p.DepartamentoID)
	if err != nil{
		return errors.New("ID do departamento raiz não encontrado")
	}

	return nil
}
