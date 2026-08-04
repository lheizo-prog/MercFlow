package service

import (
	"MercFlow/internal/models"
	produtogenerico "MercFlow/internal/repository/produto-generico"
	produtomercearia "MercFlow/internal/repository/produto-mercearia"
	"errors"
	"strings"
)

type ProdutoMerceariaService struct {
	ProdutoMerceariaRepo produtomercearia.ProdutoMerceariaRepository
	ProdutoRepo produtogenerico.ProdutoGenericoRepository
}

func NovoProdutoMerceariaService(
	produtoMerceariaRepo produtomercearia.ProdutoMerceariaRepository,
	produtoRepo produtogenerico.ProdutoGenericoRepository,
) *ProdutoMerceariaService {
	return &ProdutoMerceariaService{
		ProdutoMerceariaRepo: produtoMerceariaRepo,
		ProdutoRepo: produtoRepo,
	}
}

func (s *ProdutoMerceariaService) Criar(p *models.ProdutoMercearia) (*models.ProdutoMercearia,error) {
	if err := s.ValidarProduto(p); err != nil{
		return nil, err
	}
	res, err := s.ProdutoMerceariaRepo.BuscarInativo(p.SKU)
	if err == nil{
		
		return nil, s.ProdutoMerceariaRepo.Reativar(res.ID)
	}
	
	return s.ProdutoMerceariaRepo.Criar(p)
}


func (s *ProdutoMerceariaService)Atualizar(p *models.ProdutoMercearia) (*models.ProdutoMercearia, error){
	if err := s.ValidarProduto(p); err != nil{
		return nil, err
	}
	
	return s.ProdutoMerceariaRepo.Atualizar(p)
}

func (s *ProdutoMerceariaService)Listar() ([]*models.ProdutoMercearia, error){
	produtos, err := s.ProdutoMerceariaRepo.Listar()
	if err != nil{
		return nil, err
	}
	return produtos, nil
}

func (s *ProdutoMerceariaService)RemoverID(id int) error{
	if id <= 0{
		return errors.New("ID inválido")
	}

	return s.ProdutoMerceariaRepo.RemoverID(id)
}


func (s *ProdutoMerceariaService)BuscarID(id int) (*models.ProdutoMercearia, error){
	produto, err := s.ProdutoMerceariaRepo.BuscarID(id)
	if err != nil{
		return nil, err
	}
	
	return produto, nil
}

func (s *ProdutoMerceariaService)BuscarSKU(sku string) (*models.ProdutoMercearia, error){
	produto, err := s.ProdutoMerceariaRepo.BuscarSKU(sku)
	if err != nil{
		return nil, err
	}

	return produto, nil
}

func (s *ProdutoMerceariaService)BuscarCodigoBarras(codigo_barras string) (*models.ProdutoMercearia, error){
	produto, err := s.ProdutoMerceariaRepo.BuscarCodigoBarras(codigo_barras)
	if err != nil{
		return nil, err
	}

	return produto, nil
}

func (s *ProdutoMerceariaService)Buscar(texto string) ([]*models.ProdutoMercearia, error){
	produtos, err := s.ProdutoMerceariaRepo.Buscar(texto)
	if err != nil{
		return nil, err
	}

	return produtos, nil
}

func (s *ProdutoMerceariaService)ValidarProduto(p *models.ProdutoMercearia) error{
	pS := s.ProdutoRepo

	if p == nil{
		return errors.New("produto inválido")
	}

	//Verificadores dos parâmetros do Produto Mercearia
	if strings.TrimSpace(p.Descricao) == ""{
		return errors.New("descrição do produto inválida")
	}
	if strings.TrimSpace(p.Marca) == ""{
		return errors.New("marca do produto inválida")
	}
	if strings.TrimSpace(p.SKU) == ""{
		return errors.New("SKU do produto inválido")
	}
	if strings.TrimSpace(p.CodigoBarras) == ""{
		return errors.New("codigo de barras inválido")
	}
	if p.ProdutoGenericoID <= 0{
		return errors.New("ID do produto genérico inválido")
	}
	if p.QuantidadeEmbalagem <= 0{
		return errors.New("quantidade inválida por embalagem")
	}
	if !p.UnidadeMedida.Valido() {
		return errors.New("unidade de medida inválida")
	}
	
	//Verificador dos repositórios do produto genérico
	_, err := pS.BuscarID(p.ProdutoGenericoID)
	if err != nil{
		return errors.New("ID do produto genérico não encontrado")
	}

	return nil
}