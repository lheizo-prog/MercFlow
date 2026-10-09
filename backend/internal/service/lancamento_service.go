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
	lancamentoRepo    lancamento.LancamentoRepository
	produtoMRepo      produtomercearia.ProdutoMerceariaRepository
	produtoDRepo      produtodepartamento.ProdutoDepartamentoRepository
	departamentoRepo  departamento.DepartamentoRepository
	labelReaderClient *LabelReaderClient
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

func (s *LancamentoService) SetLabelReaderClient(client *LabelReaderClient) {
	s.labelReaderClient = client
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
				UnidadeMercearia:   normalizarUnidadeMedida(string(produto.UnidadeMedida)),
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
				UnidadeDepartamento:   normalizarUnidadeMedida(string(produto.UnidadeMedida)),
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
		UnidadeMercearia:      normalizarUnidadeMedida(string(produtoMercearia.UnidadeMedida)),
		UnidadeDepartamento:   normalizarUnidadeMedida(string(produtoDepartamento.UnidadeMedida)),
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
	return strings.ToLower(normalizarUnidadeMedida(unidade))
}

// normalizarUnidadeMedida padroniza valores de unidades de medida para o formato superior consistente (KG, GR, L, ML, UN)
func normalizarUnidadeMedida(valor string) string {
	u := strings.ToUpper(strings.TrimSpace(valor))
	switch u {
	case "KG", "KILO", "KILOGRAMA":
		return "KG"
	case "GR", "G", "GRAMA":
		return "GR"
	case "L", "LT", "LITRO":
		return "L"
	case "ML", "MILLILITRO":
		return "ML"
	case "UN", "U", "UNIDADE", "UND":
		return "UN"
	default:
		return u
	}
}

func calcularFatorConversao(
	unidadeOrigem string,
	unidadeDestino string,
) (float64, error) {
	origem := normalizarUnidade(unidadeOrigem)
	destino := normalizarUnidade(unidadeDestino)

	if origem == destino && origem != "" {
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

func (s *LancamentoService) ScanEtiquetas(imageBytes []byte, filename string, lojaID int, departamentoID int, tipos ...string) (*response.ScanEtiquetasResponse, error) {
	if s.labelReaderClient == nil {
		return nil, errors.New("serviço de leitura de etiquetas não configurado")
	}

	ocrResp, err := s.labelReaderClient.ProcessImage(imageBytes, filename)
	if err != nil {
		return nil, err
	}

	tipoLancamento := ""
	if len(tipos) > 0 {
		tipoLancamento = strings.ToUpper(strings.TrimSpace(tipos[0]))
	}

	// Verifica se o departamento informado é o departamento de Mercearia
	isDeptoMercearia := false
	if s.departamentoRepo != nil && departamentoID > 0 {
		if dep, err := s.departamentoRepo.BuscarID(departamentoID); err == nil && dep != nil {
			if strings.EqualFold(strings.TrimSpace(dep.Nome), "mercearia") {
				isDeptoMercearia = true
			}
		}
	}

	// Carrega produtos da loja para matching em memória/rápido
	produtosM, err := s.produtoMRepo.ListarPorLoja(lojaID)
	if err != nil {
		return nil, fmt.Errorf("erro ao buscar produtos de mercearia da loja: %w", err)
	}

	var produtosD []*models.ProdutoDepartamento
	if s.produtoDRepo != nil {
		produtosD, _ = s.produtoDRepo.ListarPorLoja(lojaID)
	}

	res := &response.ScanEtiquetasResponse{
		TotalDetectados: len(ocrResp.Labels),
		Itens:           make([]response.ScanItemResponse, 0, len(ocrResp.Labels)),
	}

	for _, label := range ocrResp.Labels {
		item := response.ScanItemResponse{
			LabelIndex: label.LabelIndex,
			CodigoLido: label.ParsedCode,
			Confianca:  label.Confidence,
			Status:     "NAO_ENCONTRADO",
		}

		codigoOriginalLimpo := strings.TrimSpace(label.ParsedCode)
		if codigoOriginalLimpo == "" {
			item.CodigoLido = label.RawText
			res.Itens = append(res.Itens, item)
			continue
		}

		// Se a Quebra for em um departamento que NÃO seja a Mercearia,
		// busca prioritariamente nos produtos daquele departamento
		if tipoLancamento == "QUEBRA" && departamentoID > 0 && !isDeptoMercearia {
			var matchExatoD *models.ProdutoDepartamento
			for _, pd := range produtosD {
				if pd.DepartamentoID == departamentoID && strings.EqualFold(pd.Codigo, codigoOriginalLimpo) {
					matchExatoD = pd
					break
				}
			}

			if matchExatoD != nil {
				item.Status = "IDENTIFICADO"
				item.ProdutoDepartamento = matchExatoD
				res.TotalIdentificados++
				res.Itens = append(res.Itens, item)
				continue
			}

			// Variações de confusão visual para Produto do Departamento
			var sugestoesDept []response.SugestaoProdutoDepartamento
			for _, varCod := range label.CandidateVariations {
				varCodLimpo := strings.TrimSpace(varCod)
				if varCodLimpo == "" || varCodLimpo == codigoOriginalLimpo {
					continue
				}
				for _, pd := range produtosD {
					if pd.DepartamentoID == departamentoID && strings.EqualFold(pd.Codigo, varCodLimpo) {
						sugestoesDept = append(sugestoesDept, response.SugestaoProdutoDepartamento{
							Produto: pd,
							Score:   0.85,
							Motivo:  fmt.Sprintf("Variação compatível com '%s'", varCodLimpo),
						})
						if len(sugestoesDept) >= 3 {
							break
						}
					}
				}
				if len(sugestoesDept) >= 3 {
					break
				}
			}

			if len(sugestoesDept) > 0 {
				item.Status = "SUGESTAO"
				item.SugestoesDepartamento = sugestoesDept
				res.Itens = append(res.Itens, item)
				continue
			}
		}

		// Busca nos produtos da Mercearia (Match Exato por Código de Barras ou SKU)
		var matchExatoM *models.ProdutoMercearia
		for _, p := range produtosM {
			if strings.EqualFold(p.CodigoBarras, codigoOriginalLimpo) || strings.EqualFold(p.SKU, codigoOriginalLimpo) {
				matchExatoM = p
				break
			}
		}

		if matchExatoM != nil {
			item.Status = "IDENTIFICADO"
			item.ProdutoMercearia = matchExatoM
			res.TotalIdentificados++

			// Procura produto do departamento com o mesmo produto_generico_id se relevante
			for _, pd := range produtosD {
				if pd.ProdutoGenericoID == matchExatoM.ProdutoGenericoID {
					if departamentoID <= 0 || pd.DepartamentoID == departamentoID {
						item.ProdutoDepartamentoSugerido = pd
						break
					}
				}
			}
			res.Itens = append(res.Itens, item)
			continue
		}

		// Se não encontrou exato na mercearia, testa as variações de confusão visual
		var sugestoes []response.SugestaoProdutoMercearia
		for _, varCod := range label.CandidateVariations {
			varCodLimpo := strings.TrimSpace(varCod)
			if varCodLimpo == "" || varCodLimpo == codigoOriginalLimpo {
				continue
			}
			for _, p := range produtosM {
				if strings.EqualFold(p.CodigoBarras, varCodLimpo) || strings.EqualFold(p.SKU, varCodLimpo) {
					sugestoes = append(sugestoes, response.SugestaoProdutoMercearia{
						Produto: p,
						Score:   0.85,
						Motivo:  fmt.Sprintf("Variação compatível com '%s'", varCodLimpo),
					})
					if len(sugestoes) >= 3 {
						break
					}
				}
			}
			if len(sugestoes) >= 3 {
				break
			}
		}

		if len(sugestoes) > 0 {
			item.Status = "SUGESTAO"
			item.Sugestoes = sugestoes
		}

		res.Itens = append(res.Itens, item)
	}

	return res, nil
}

