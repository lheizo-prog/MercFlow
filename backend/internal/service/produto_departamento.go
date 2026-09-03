package service

import (
	"MercFlow/internal/models"
	"MercFlow/internal/repository/departamento"
	produtodepartamento "MercFlow/internal/repository/produto-departamento"
	produtogenerico "MercFlow/internal/repository/produto-generico"
	"errors"
	"strings"
)

type ProdutoDepartamentoService struct {
	ProdutoDepartamentoRepo produtodepartamento.ProdutoDepartamentoRepository
	ProdutoRepo             produtogenerico.ProdutoGenericoRepository
	DepartamentoRepo        departamento.DepartamentoRepository
}

func NovoProdutoDepartamentoService(
	produtoDepartamentoRepo produtodepartamento.ProdutoDepartamentoRepository,
	produtoRepo produtogenerico.ProdutoGenericoRepository,
	departamentoRepo departamento.DepartamentoRepository,

) *ProdutoDepartamentoService {
	return &ProdutoDepartamentoService{
		ProdutoDepartamentoRepo: produtoDepartamentoRepo,
		ProdutoRepo:             produtoRepo,
		DepartamentoRepo:        departamentoRepo,
	}
}

func (s *ProdutoDepartamentoService) Criar(p *models.ProdutoDepartamento, lojas ...int) (*models.ProdutoDepartamento, error) {
	if p != nil {
		p.LojaID = lojaSolicitada(lojas)
	}
	if err := s.ValidarProdutoD(p); err != nil {
		return nil, err
	}
	res, err := s.ProdutoDepartamentoRepo.BuscarInativo(p.ProdutoGenericoID, p.DepartamentoID, p.Codigo)
	if err == nil {
		if !pertenceALoja(p.LojaID, res.LojaID) {
			return nil, erroAcessoLoja()
		}
		return nil, s.ProdutoDepartamentoRepo.Reativar(res.ID)
	}
	return s.ProdutoDepartamentoRepo.Criar(p)
}

func (s *ProdutoDepartamentoService) Atualizar(p *models.ProdutoDepartamento, lojas ...int) (*models.ProdutoDepartamento, error) {
	if p != nil {
		p.LojaID = lojaSolicitada(lojas)
	}
	if err := s.ValidarProdutoD(p); err != nil {
		return nil, err
	}

	recurso, err := s.ProdutoDepartamentoRepo.BuscarID(p.ID)
	if err != nil || !pertenceALoja(lojaSolicitada(lojas), recurso.LojaID) {
		return nil, erroAcessoLoja()
	}
	return s.ProdutoDepartamentoRepo.Atualizar(p)
}

func (s *ProdutoDepartamentoService) RemoverID(id int, lojas ...int) error {
	if id <= 0 {
		return errors.New("ID inválido")
	}

	recurso, err := s.ProdutoDepartamentoRepo.BuscarID(id)
	if err != nil || !pertenceALoja(lojaSolicitada(lojas), recurso.LojaID) {
		return erroAcessoLoja()
	}
	return s.ProdutoDepartamentoRepo.RemoverID(id)
}

func (s *ProdutoDepartamentoService) Listar(lojas ...int) ([]*models.ProdutoDepartamento, error) {
	produtos, err := s.ProdutoDepartamentoRepo.Listar()
	if err != nil {
		return nil, err
	}

	lojaID := lojaSolicitada(lojas)
	if lojaID <= 0 {
		return produtos, nil
	}
	filtrados := make([]*models.ProdutoDepartamento, 0, len(produtos))
	for _, produto := range produtos {
		if produto.LojaID == lojaID {
			filtrados = append(filtrados, produto)
		}
	}
	return filtrados, nil
}

func (s *ProdutoDepartamentoService) BuscarID(id int, lojas ...int) (*models.ProdutoDepartamento, error) {
	produto, err := s.ProdutoDepartamentoRepo.BuscarID(id)
	if err != nil {
		return nil, err
	}

	if !pertenceALoja(lojaSolicitada(lojas), produto.LojaID) {
		return nil, erroAcessoLoja()
	}
	return produto, nil
}

func (s *ProdutoDepartamentoService) BuscarCodigo(codigo string, lojas ...int) (*models.ProdutoDepartamento, error) {
	produto, err := s.ProdutoDepartamentoRepo.BuscarCodigo(codigo)
	if err != nil {
		return nil, err
	}

	if !pertenceALoja(lojaSolicitada(lojas), produto.LojaID) {
		return nil, erroAcessoLoja()
	}
	return produto, nil
}

func (s *ProdutoDepartamentoService) ValidarProdutoD(p *models.ProdutoDepartamento) error {
	pS := s.ProdutoRepo
	dS := s.DepartamentoRepo

	if p == nil {
		return errors.New("produto inválido")
	}

	p.UnidadeMedida = p.UnidadeMedida.Normalizado()

	//Verificadores dos parâmetros do produto departamento
	if strings.TrimSpace(p.Nome) == "" {
		return errors.New("nome do produto é obrigatório")
	}
	if strings.TrimSpace(p.Codigo) == "" {
		return errors.New("código do produto é obrigatório")
	}
	if p.ProdutoGenericoID <= 0 || p.DepartamentoID <= 0 {
		return errors.New("ID do produto genérico e/ou do departamento inválido(s)")
	}
	if !p.UnidadeMedida.Valido() {
		return errors.New("unidade de medida inválida")
	}

	//Verificador dos repositórios do produto genérico
	produtoGenerico, err := pS.BuscarID(p.ProdutoGenericoID)
	if err != nil {
		return errors.New("ID do produto genérico não encontrado")
	}
	if !pertenceALoja(p.LojaID, produtoGenerico.LojaID) {
		return erroAcessoLoja()
	}

	//Verficador dos repositórios do departamento
	departamento, err := dS.BuscarID(p.DepartamentoID)
	if err != nil {
		return errors.New("ID do departamento raiz não encontrado")
	}
	if !pertenceALoja(p.LojaID, departamento.LojaID) {
		return erroAcessoLoja()
	}

	return nil
}
