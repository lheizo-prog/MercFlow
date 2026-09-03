package service

import (
	"MercFlow/internal/models"
	request "MercFlow/internal/models/requests"
	response "MercFlow/internal/models/response"
	"MercFlow/internal/repository/departamento"
	"MercFlow/internal/repository/lancamento"
	produtodepartamento "MercFlow/internal/repository/produto-departamento"
	produtomercearia "MercFlow/internal/repository/produto-mercearia"
	"errors"
	"fmt"
	"strings"
)

type LancamentoService struct {
	lancamentoRepo   lancamento.LancamentoRepository
	produtoMRepo     produtomercearia.ProdutoMerceariaRepository
	produtoDRepo     produtodepartamento.ProdutoDepartamentoRepository
	departamentoRepo departamento.DepartamentoRepository
}

func NovoLancamentoService(
	lancamentoRepo lancamento.LancamentoRepository,
	produtoMRepo produtomercearia.ProdutoMerceariaRepository,
	produtoDRepo produtodepartamento.ProdutoDepartamentoRepository,
	departamentoRepos ...departamento.DepartamentoRepository,
) *LancamentoService {
	var departamentoRepo departamento.DepartamentoRepository
	if len(departamentoRepos) > 0 {
		departamentoRepo = departamentoRepos[0]
	}
	return &LancamentoService{
		lancamentoRepo:   lancamentoRepo,
		produtoMRepo:     produtoMRepo,
		produtoDRepo:     produtoDRepo,
		departamentoRepo: departamentoRepo,
	}
}

func (s *LancamentoService) Criar(request *request.LancamentoRequest, lojas ...int) (*response.LancamentoResponse, error) {
	if request == nil {
		return nil, errors.New("lançamento não informado")
	}

	if err := validarLancamentoRequest(request); err != nil {
		return nil, err
	}

	lojaID := lojaSolicitada(lojas)
	if s.departamentoRepo != nil {
		departamento, err := s.departamentoRepo.BuscarID(request.DepartamentoID)
		if err != nil || !pertenceALoja(lojaID, departamento.LojaID) {
			return nil, erroAcessoLoja()
		}
	}

	switch request.Tipo {
	case "TRANSFERENCIA":
		return s.criarTransferencia(request, lojaID)

	case "QUEBRA":
		return s.criarQuebra(request, lojaID)

	default:
		return nil, errors.New("tipo de lançamento inválido")
	}
}

func (s *LancamentoService) Listar(lojas ...int) ([]models.Lancamento, error) {
	lojaID := lojaSolicitada(lojas)
	if lojaID <= 0 {
		return s.lancamentoRepo.Listar()
	}
	return s.lancamentoRepo.ListarPorLoja(lojaID)
}

func (s *LancamentoService) BuscarID(id int, lojas ...int) (*models.Lancamento, error) {
	lancamento, err := s.lancamentoRepo.BuscarID(id)
	if err != nil {
		return nil, err
	}

	if !pertenceALoja(lojaSolicitada(lojas), lancamento.LojaID) {
		return nil, erroAcessoLoja()
	}
	return lancamento, nil
}

func (s *LancamentoService) CalcularConversao(item request.LancamentoItem, lojas ...int) (*response.LancamentoItemResponse, error) {
	if item.ProdutoMerceariaID == nil {
		return nil, errors.New("produto da mercearia não informado")
	}
	if item.ProdutoDepartamentoID == nil {
		return nil, errors.New("produto do departamento não informado")
	}

	return s.processarItemTransferencia(item, lojaSolicitada(lojas))
}

func (s *LancamentoService) criarTransferencia(request *request.LancamentoRequest, lojaID int) (*response.LancamentoResponse, error) {
	observacao := ""

	if request.Observacao != nil {
		observacao = *request.Observacao
	}

	lancamentoModel := &models.Lancamento{
		LojaID:         lojaID,
		Tipo:           models.TipoLancamento(request.Tipo),
		DepartamentoID: request.DepartamentoID,
		Observacao:     request.Observacao,
	}

	lancamentoResponse := &response.LancamentoResponse{
		Tipo:           string(request.Tipo),
		DepartamentoID: request.DepartamentoID,
		Observacao:     observacao,
		Itens:          make([]response.LancamentoItemResponse, 0),
	}

	for _, item := range request.Itens {
		if item.ProdutoMerceariaID == nil {
			return nil, errors.New("transferência exige produto da mercearia")
		}

		if item.ProdutoDepartamentoID == nil {
			return nil, errors.New("transferência exige produto do departamento")
		}

		if item.Quantidade <= 0 {
			return nil, errors.New("quantidade deve ser maior que 0")
		}

		itemResponse, err := s.processarItemTransferencia(item, lojaID)
		if err != nil {
			return nil, err
		}

		lancamentoResponse.Itens = append(lancamentoResponse.Itens, *itemResponse)

		lancamentoModel.Itens = append(lancamentoModel.Itens, models.LancamentoItem{
			ProdutoMerceariaID:    item.ProdutoMerceariaID,
			ProdutoDepartamentoID: item.ProdutoDepartamentoID,
			Quantidade:            item.Quantidade,
		})
	}

	lancamentoCriado, err := s.lancamentoRepo.Criar(lancamentoModel)
	if err != nil {
		return nil, err
	}
	if lancamentoCriado == nil {
		return nil, errors.New("repositório não retornou o lançamento criado")
	}

	lancamentoResponse.ID = lancamentoCriado.ID
	lancamentoResponse.Data = lancamentoCriado.Data

	return lancamentoResponse, nil
}
func (s *LancamentoService) criarQuebra(request *request.LancamentoRequest, lojaID int) (*response.LancamentoResponse, error) {
	observacao := ""

	if request.Observacao != nil {
		observacao = *request.Observacao
	}

	lancamentoModel := &models.Lancamento{
		LojaID:         lojaID,
		Tipo:           models.TipoLancamento(request.Tipo),
		DepartamentoID: request.DepartamentoID,
		Observacao:     request.Observacao,
	}

	lancamentoResponse := &response.LancamentoResponse{
		DepartamentoID: request.DepartamentoID,
		Tipo:           string(request.Tipo),
		Observacao:     observacao,
		Itens:          make([]response.LancamentoItemResponse, 0),
	}

	for _, item := range request.Itens {
		if item.ProdutoMerceariaID == nil && item.ProdutoDepartamentoID == nil {
			return nil, errors.New("quebra exige produto da mercearia ou do departamento")
		}

		if item.Quantidade <= 0 {
			return nil, errors.New("quantidade deve ser maior que 0")
		}

		if item.ProdutoMerceariaID != nil && item.ProdutoDepartamentoID != nil {
			return nil, errors.New("quebra deve possuir apenas um produto")
		}

		var itemResponse *response.LancamentoItemResponse

		if item.ProdutoMerceariaID != nil {
			produto, err := s.produtoMRepo.BuscarID(*item.ProdutoMerceariaID)
			if err != nil {
				return nil, err
			}
			if !pertenceALoja(lojaID, produto.LojaID) {
				return nil, erroAcessoLoja()
			}

			itemResponse = &response.LancamentoItemResponse{
				ProdutoMerceariaID: produto.ID,
				Quantidade:         item.Quantidade,
				UnidadeMercearia:   string(produto.UnidadeMedida),
				TotalLancado:       item.Quantidade * produto.QuantidadeEmbalagem,
			}
		}

		if item.ProdutoDepartamentoID != nil {
			produto, err := s.produtoDRepo.BuscarID(*item.ProdutoDepartamentoID)
			if err != nil {
				return nil, err
			}
			if !pertenceALoja(lojaID, produto.LojaID) {
				return nil, erroAcessoLoja()
			}

			itemResponse = &response.LancamentoItemResponse{
				ProdutoDepartamentoID: produto.ID,
				Quantidade:            item.Quantidade,
				UnidadeDepartamento:   string(produto.UnidadeMedida),
				TotalLancado:          item.Quantidade,
			}
		}
		lancamentoResponse.Itens = append(lancamentoResponse.Itens, *itemResponse)

		lancamentoModel.Itens = append(lancamentoModel.Itens, models.LancamentoItem{
			ProdutoMerceariaID:    item.ProdutoMerceariaID,
			ProdutoDepartamentoID: item.ProdutoDepartamentoID,
			Quantidade:            item.Quantidade,
		})
	}

	lancamentoCriado, err := s.lancamentoRepo.Criar(lancamentoModel)
	if err != nil {
		return nil, err
	}
	if lancamentoCriado == nil {
		return nil, errors.New("repositório não retornou o lançamento criado")
	}

	lancamentoResponse.ID = lancamentoCriado.ID
	lancamentoResponse.Data = lancamentoCriado.Data

	return lancamentoResponse, nil
}

func (s *LancamentoService) processarItemTransferencia(item request.LancamentoItem, lojaID int) (*response.LancamentoItemResponse, error) {
	produtoMercearia, err := s.produtoMRepo.BuscarID(*item.ProdutoMerceariaID)
	if err != nil {
		return nil, err
	}
	if !pertenceALoja(lojaID, produtoMercearia.LojaID) {
		return nil, erroAcessoLoja()
	}

	produtoDepartamento, err := s.produtoDRepo.BuscarID(*item.ProdutoDepartamentoID)
	if err != nil {
		return nil, err
	}
	if !pertenceALoja(lojaID, produtoDepartamento.LojaID) {
		return nil, erroAcessoLoja()
	}

	if produtoMercearia.ProdutoGenericoID != produtoDepartamento.ProdutoGenericoID {
		return nil, errors.New("produto mercearia e produto do departamento não pertencem ao mesmo produto base")
	}

	fatorConversao, err := calcularFatorConversao(
		string(produtoMercearia.UnidadeMedida),
		string(produtoDepartamento.UnidadeMedida),
	)
	if err != nil {
		return nil, err
	}

	totalLancado := item.Quantidade * produtoMercearia.QuantidadeEmbalagem * fatorConversao

	return &response.LancamentoItemResponse{
		ProdutoMerceariaID:    produtoMercearia.ID,
		ProdutoDepartamentoID: produtoDepartamento.ID,
		Quantidade:            item.Quantidade,
		UnidadeMercearia:      string(produtoMercearia.UnidadeMedida),
		UnidadeDepartamento:   string(produtoDepartamento.UnidadeMedida),
		FatorConversao:        fatorConversao,
		TotalLancado:          totalLancado,
	}, nil
}

func validarLancamentoRequest(request *request.LancamentoRequest) error {
	if request == nil {
		return errors.New("lançamento não informado")
	}
	if request.DepartamentoID <= 0 {
		return errors.New("departamento inválido")
	}
	if len(request.Itens) == 0 {
		return errors.New("o lançamento deve possuir pelo menos um item")
	}

	if request.Tipo == "" {
		return errors.New("tipo de lançamento não informado")
	}

	return nil
}

func normalizarUnidade(unidade string) string {
	unidade = strings.ToLower(strings.TrimSpace(unidade))

	if unidade == "g" {
		return "gr"
	}

	return unidade
}

func calcularFatorConversao(
	unidadeOrigem string,
	unidadeDestino string,
) (float64, error) {
	origem := normalizarUnidade(unidadeOrigem)
	destino := normalizarUnidade(unidadeDestino)

	if origem == destino {
		return 1, nil
	}

	switch origem {
	case "kg":
		if destino == "gr" {
			return 1000, nil
		}

	case "gr":
		if destino == "kg" {
			return 0.001, nil
		}

	case "l":
		if destino == "ml" {
			return 1000, nil
		}

	case "ml":
		if destino == "l" {
			return 0.001, nil
		}
	}
	return 0, fmt.Errorf(
		"não é possível converter %s para %s",
		origem,
		destino,
	)
}
