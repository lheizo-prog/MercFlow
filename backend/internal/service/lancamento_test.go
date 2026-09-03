package service

import (
	"MercFlow/internal/models"
	request "MercFlow/internal/models/requests"
	"errors"
	"testing"
	"time"
)

type produtoMerceariaRepositoryMock struct {
	produto *models.ProdutoMercearia
	err     error
}

type produtoDepartamentoRepositoryMock struct {
	produto *models.ProdutoDepartamento
	err     error
}

type lancamentoRepositoryMock struct {
	lancamento *models.Lancamento
	err        error
}

// Produto mercearia
func (m *produtoMerceariaRepositoryMock) Criar(p *models.ProdutoMercearia) (*models.ProdutoMercearia, error) {
	return m.produto, m.err
}
func (m *produtoMerceariaRepositoryMock) Atualizar(p *models.ProdutoMercearia) (*models.ProdutoMercearia, error) {
	return m.produto, m.err
}
func (m *produtoMerceariaRepositoryMock) Listar() ([]*models.ProdutoMercearia, error) {
	return nil, m.err
}
func (m *produtoMerceariaRepositoryMock) RemoverID(id int) error {
	return m.err
}
func (m *produtoMerceariaRepositoryMock) BuscarID(id int) (*models.ProdutoMercearia, error) {
	return m.produto, m.err
}
func (m *produtoMerceariaRepositoryMock) BuscarSKU(sku string) (*models.ProdutoMercearia, error) {
	return m.produto, m.err
}
func (m *produtoMerceariaRepositoryMock) BuscarCodigoBarras(codigo string) (*models.ProdutoMercearia, error) {
	return m.produto, m.err
}
func (m *produtoMerceariaRepositoryMock) Buscar(texto string) ([]*models.ProdutoMercearia, error) {
	return nil, m.err
}
func (m *produtoMerceariaRepositoryMock) BuscarInativo(sku string) (*models.ProdutoMercearia, error) {
	return m.produto, m.err
}
func (m *produtoMerceariaRepositoryMock) Reativar(id int) error {
	return m.err
}

// Produto departamento
func (d *produtoDepartamentoRepositoryMock) Criar(p *models.ProdutoDepartamento) (*models.ProdutoDepartamento, error) {
	return d.produto, d.err
}
func (d *produtoDepartamentoRepositoryMock) Atualizar(p *models.ProdutoDepartamento) (*models.ProdutoDepartamento, error) {
	return d.produto, d.err
}
func (d *produtoDepartamentoRepositoryMock) Listar() ([]*models.ProdutoDepartamento, error) {
	return nil, d.err
}
func (d *produtoDepartamentoRepositoryMock) RemoverID(id int) error {
	return d.err
}
func (d *produtoDepartamentoRepositoryMock) BuscarID(id int) (*models.ProdutoDepartamento, error) {
	return d.produto, d.err
}
func (d *produtoDepartamentoRepositoryMock) BuscarSKU(sku string) (*models.ProdutoDepartamento, error) {
	return d.produto, d.err
}
func (d *produtoDepartamentoRepositoryMock) BuscarCodigo(codigo string) (*models.ProdutoDepartamento, error) {
	return d.produto, d.err
}
func (d *produtoDepartamentoRepositoryMock) Buscar(texto string) ([]*models.ProdutoDepartamento, error) {
	return nil, d.err
}
func (d *produtoDepartamentoRepositoryMock) BuscarInativo(departamentoID, produtoGenericoID int, codigo string) (*models.ProdutoDepartamento, error) {
	return d.produto, d.err
}
func (d *produtoDepartamentoRepositoryMock) Reativar(id int) error {
	return d.err
}

// Lançamento
func (l *lancamentoRepositoryMock) Criar(lancamento *models.Lancamento) (*models.Lancamento, error) {
	return l.lancamento, l.err
}
func (l *lancamentoRepositoryMock) BuscarID(id int) (*models.Lancamento, error) {
	return l.lancamento, l.err
}
func (l *lancamentoRepositoryMock) Listar() ([]models.Lancamento, error) {
	return nil, l.err
}
func (l *lancamentoRepositoryMock) ListarPorLoja(lojaID int) ([]models.Lancamento, error) {
	return nil, l.err
}

func TestCriarQuebraProdutoMercearia(t *testing.T) {

	produtoMercearia := &models.ProdutoMercearia{
		ID:                  10,
		LojaID:              1,
		ProdutoGenericoID:   5,
		SKU:                 "ARROZ-001",
		Marca:               "Marca Teste",
		Descricao:           "Arroz teste",
		CodigoBarras:        "123456789",
		QuantidadeEmbalagem: 1,
		UnidadeMedida:       "kg",
		Ativo:               true,
	}

	produtoMRepo := &produtoMerceariaRepositoryMock{
		produto: produtoMercearia,
	}

	produtoDRepo := &produtoDepartamentoRepositoryMock{}

	quantidade := 2.0
	lancamentoRepo := &lancamentoRepositoryMock{
		lancamento: &models.Lancamento{
			ID:             77,
			Tipo:           models.TipoLancamento("QUEBRA"),
			DepartamentoID: 1,
			Data:           time.Now(),
			Itens: []models.LancamentoItem{{
				ProdutoMerceariaID: &produtoMercearia.ID,
				Quantidade:         quantidade,
			}},
		},
	}

	service := NovoLancamentoService(
		lancamentoRepo,
		produtoMRepo,
		produtoDRepo,
	)

	req := &request.LancamentoRequest{
		Tipo:           "QUEBRA",
		DepartamentoID: 1,
		Itens: []request.LancamentoItem{
			{
				ProdutoMerceariaID:    &produtoMercearia.ID,
				ProdutoDepartamentoID: nil,
				Quantidade:            quantidade,
			},
		},
	}

	resultado, err := service.Criar(req, 1)

	if err != nil {
		t.Fatalf("esperava que não houvesse erro, mas recebeu: %v", err)
	}

	if resultado == nil {
		t.Fatal("esperava um response, mas recebeu nil")
	}

	if len(resultado.Itens) != 1 {
		t.Fatalf(
			"esperava 1 item no response, mas recebeu %d",
			len(resultado.Itens),
		)
	}

	item := resultado.Itens[0]

	if item.ProdutoMerceariaID != produtoMercearia.ID {
		t.Errorf(
			"esperava ProdutoMerceariaID %d, recebeu %d",
			produtoMercearia.ID,
			item.ProdutoMerceariaID,
		)
	}

	if item.Quantidade != quantidade {
		t.Errorf(
			"esperava quantidade %.2f, recebeu %.2f",
			quantidade,
			item.Quantidade,
		)
	}

	if item.UnidadeMercearia != "kg" {
		t.Errorf(
			"esperava unidade kg, recebeu %s",
			item.UnidadeMercearia,
		)
	}

	if item.TotalLancado != quantidade {
		t.Errorf(
			"esperava TotalLancado %.2f, recebeu %.2f",
			quantidade,
			item.TotalLancado,
		)
	}
}

func TestCriarQuebraProdutoMerceariaMultiplicaQuantidadeEmbalagem(t *testing.T) {
	produtoMercearia := &models.ProdutoMercearia{
		ID:                  15,
		LojaID:              1,
		ProdutoGenericoID:   7,
		SKU:                 "PAO-400",
		Marca:               "Padaria",
		Descricao:           "Pão de forma",
		CodigoBarras:        "987654321",
		QuantidadeEmbalagem: 400,
		UnidadeMedida:       "GR",
		Ativo:               true,
	}

	produtoMRepo := &produtoMerceariaRepositoryMock{produto: produtoMercearia}
	produtoDRepo := &produtoDepartamentoRepositoryMock{}
	lancamentoRepo := &lancamentoRepositoryMock{
		lancamento: &models.Lancamento{
			ID:             90,
			LojaID:         1,
			Tipo:           models.TipoLancamento("QUEBRA"),
			DepartamentoID: 2,
			Data:           time.Now(),
			Itens: []models.LancamentoItem{{
				ProdutoMerceariaID: &produtoMercearia.ID,
				Quantidade:         2,
			}},
		},
	}

	service := NovoLancamentoService(lancamentoRepo, produtoMRepo, produtoDRepo)

	resultado, err := service.Criar(&request.LancamentoRequest{
		Tipo:           "QUEBRA",
		DepartamentoID: 2,
		Itens: []request.LancamentoItem{{
			ProdutoMerceariaID: &produtoMercearia.ID,
			Quantidade:         2,
		}},
	}, 1)
	if err != nil {
		t.Fatalf("esperava que não houvesse erro, mas recebeu: %v", err)
	}

	if len(resultado.Itens) != 1 {
		t.Fatalf("esperava 1 item, recebeu %d", len(resultado.Itens))
	}

	if resultado.Itens[0].TotalLancado != 800 {
		t.Fatalf("esperava total de 800g para 2 embalagens de 400g, recebeu %.2f", resultado.Itens[0].TotalLancado)
	}
}

func TestCriarQuebraProdutoDepartamento(t *testing.T) {
	produtoDepartamento := &models.ProdutoDepartamento{
		ID:                20,
		LojaID:            1,
		ProdutoGenericoID: 5,
		Nome:              "Arroz 1kg",
		Codigo:            "ARR-01",
		UnidadeMedida:     "KG",
	}

	produtoDRepo := &produtoDepartamentoRepositoryMock{
		produto: produtoDepartamento,
	}

	produtoMRepo := &produtoMerceariaRepositoryMock{}

	quantidade := 3.0
	lancamentoRepo := &lancamentoRepositoryMock{
		lancamento: &models.Lancamento{
			ID:             88,
			LojaID:         1,
			Tipo:           models.TipoLancamento("QUEBRA"),
			DepartamentoID: 1,
			Data:           time.Now(),
			Itens: []models.LancamentoItem{{
				ProdutoDepartamentoID: &produtoDepartamento.ID,
				Quantidade:            quantidade,
			}},
		},
	}

	service := NovoLancamentoService(
		lancamentoRepo,
		produtoMRepo,
		produtoDRepo,
	)

	req := &request.LancamentoRequest{
		Tipo:           "QUEBRA",
		DepartamentoID: 1,
		Itens: []request.LancamentoItem{
			{
				ProdutoMerceariaID:    nil,
				ProdutoDepartamentoID: &produtoDepartamento.ID,
				Quantidade:            quantidade,
			},
		},
	}

	resultado, err := service.Criar(req, 1)

	if err != nil {
		t.Fatalf(
			"esperava que não houvesse erro, mas recebeu: %v",
			err,
		)
	}

	if resultado == nil {
		t.Fatal("esperava um response, mas recebeu nil")
	}

	if resultado.DepartamentoID != req.DepartamentoID {
		t.Errorf(
			"esperava DepartamentoID %d, recebeu %d",
			req.DepartamentoID,
			resultado.DepartamentoID,
		)
	}

	if resultado.Tipo != "QUEBRA" {
		t.Errorf(
			"esperava tipo QUEBRA, recebeu %s",
			resultado.Tipo,
		)
	}

	if len(resultado.Itens) != 1 {
		t.Fatalf(
			"esperava 1 item no response, mas recebeu %d",
			len(resultado.Itens),
		)
	}

	item := resultado.Itens[0]

	if item.ProdutoDepartamentoID != produtoDepartamento.ID {
		t.Errorf(
			"esperava ProdutoDepartamentoID %d, recebeu %d",
			produtoDepartamento.ID,
			item.ProdutoDepartamentoID,
		)
	}

	if item.ProdutoMerceariaID != 0 {
		t.Errorf(
			"esperava ProdutoMerceariaID 0, recebeu %d",
			item.ProdutoMerceariaID,
		)
	}

	if item.Quantidade != quantidade {
		t.Errorf(
			"esperava quantidade %.2f, recebeu %.2f",
			quantidade,
			item.Quantidade,
		)
	}

	if item.UnidadeDepartamento != "KG" {
		t.Errorf(
			"esperava unidade KG, recebeu %s",
			item.UnidadeDepartamento,
		)
	}

	if item.UnidadeMercearia != "" {
		t.Errorf(
			"esperava UnidadeMercearia vazia, recebeu %s",
			item.UnidadeMercearia,
		)
	}

	if item.FatorConversao != 0 {
		t.Errorf(
			"esperava FatorConversao 0, recebeu %.4f",
			item.FatorConversao,
		)
	}

	if item.TotalLancado != quantidade {
		t.Errorf(
			"esperava TotalLancado %.2f, recebeu %.2f",
			quantidade,
			item.TotalLancado,
		)
	}
}

func TestUnidadeMedidaValidoAceitaMinusculo(t *testing.T) {
	for _, valor := range []string{"kg", "g", "gr", "l", "ml", "un"} {
		if !models.UnidadeMedida(valor).Valido() {
			t.Fatalf("esperava que %q fosse uma unidade válida", valor)
		}
	}
}

func TestCriarTransferencia(t *testing.T) {
	produtoMercearia := &models.ProdutoMercearia{
		ID:                  10,
		LojaID:              1,
		ProdutoGenericoID:   5,
		SKU:                 "ARROZ-001",
		Marca:               "Marca Teste",
		Descricao:           "Arroz teste",
		CodigoBarras:        "123456789",
		QuantidadeEmbalagem: 1,
		UnidadeMedida:       "kg",
		Ativo:               true,
	}

	produtoDepartamento := &models.ProdutoDepartamento{
		ID:                20,
		LojaID:            1,
		ProdutoGenericoID: 5,
		Nome:              "Arroz",
		Codigo:            "ARR-01",
		UnidadeMedida:     "g",
	}

	t.Run("transferência entre diferentes produtos departamento do mesmo produto base", func(t *testing.T) {
		produtoDepartamentoDestino := &models.ProdutoDepartamento{
			ID:                21,
			LojaID:            1,
			ProdutoGenericoID: 5,
			Nome:              "Arroz Extra",
			Codigo:            "ARR-02",
			UnidadeMedida:     "g",
		}

		repoM := &produtoMerceariaRepositoryMock{produto: produtoMercearia}
		repoD := &produtoDepartamentoRepositoryMock{produto: produtoDepartamentoDestino}
		lancamentoRepo := &lancamentoRepositoryMock{
			lancamento: &models.Lancamento{
				ID:             77,
				LojaID:         1,
				Tipo:           models.TipoLancamento("TRANSFERENCIA"),
				DepartamentoID: 1,
				Data:           time.Now(),
				Itens: []models.LancamentoItem{{
					ProdutoMerceariaID:    &produtoMercearia.ID,
					ProdutoDepartamentoID: &produtoDepartamentoDestino.ID,
					Quantidade:            2,
				}},
			},
		}
		service := NovoLancamentoService(lancamentoRepo, repoM, repoD)

		req := &request.LancamentoRequest{
			Tipo:           "TRANSFERENCIA",
			DepartamentoID: 1,
			Itens: []request.LancamentoItem{{
				ProdutoMerceariaID:    &produtoMercearia.ID,
				ProdutoDepartamentoID: &produtoDepartamentoDestino.ID,
				Quantidade:            2,
			}},
		}

		resultado, err := service.Criar(req, 1)
		if err != nil {
			t.Fatalf("esperava transferência válida para mesmo produto base, mas recebeu erro: %v", err)
		}
		if resultado == nil || len(resultado.Itens) != 1 {
			t.Fatalf("esperava 1 item do lançamento, recebeu %+v", resultado)
		}
	})

	produtoMRepo := &produtoMerceariaRepositoryMock{
		produto: produtoMercearia,
	}

	produtoDRepo := &produtoDepartamentoRepositoryMock{
		produto: produtoDepartamento,
	}

	quantidade := 3.0
	lancamentoRepo := &lancamentoRepositoryMock{
		lancamento: &models.Lancamento{
			ID:             99,
			LojaID:         1,
			Tipo:           models.TipoLancamento("TRANSFERENCIA"),
			DepartamentoID: 1,
			Data:           time.Now(),
			Itens: []models.LancamentoItem{{
				ProdutoMerceariaID:    &produtoMercearia.ID,
				ProdutoDepartamentoID: &produtoDepartamento.ID,
				Quantidade:            quantidade,
			}},
		},
	}

	service := NovoLancamentoService(
		lancamentoRepo,
		produtoMRepo,
		produtoDRepo,
	)

	req := &request.LancamentoRequest{
		Tipo:           "TRANSFERENCIA",
		DepartamentoID: 1,
		Itens: []request.LancamentoItem{
			{
				ProdutoMerceariaID:    &produtoMercearia.ID,
				ProdutoDepartamentoID: &produtoDepartamento.ID,
				Quantidade:            quantidade,
			},
		},
	}

	resultado, err := service.Criar(req, 1)

	if err != nil {
		t.Fatalf(
			"esperava que não houvesse erro, mas recebeu: %v",
			err,
		)
	}

	if resultado == nil {
		t.Fatal("esperava um response, mas recebeu nil")
	}

	if len(resultado.Itens) != 1 {
		t.Fatalf(
			"esperava 1 item no response, mas recebeu %d",
			len(resultado.Itens),
		)
	}

	item := resultado.Itens[0]

	if item.ProdutoMerceariaID != produtoMercearia.ID {
		t.Errorf(
			"esperava ProdutoMerceariaID %d, recebeu %d",
			produtoMercearia.ID,
			item.ProdutoMerceariaID,
		)
	}

	if item.ProdutoDepartamentoID != produtoDepartamento.ID {
		t.Errorf(
			"esperava ProdutoDepartamentoID %d, recebeu %d",
			produtoDepartamento.ID,
			item.ProdutoDepartamentoID,
		)
	}

	if item.Quantidade != quantidade {
		t.Errorf(
			"esperava quantidade %.2f, recebeu %.2f",
			quantidade,
			item.Quantidade,
		)
	}

	if item.UnidadeMercearia != "kg" {
		t.Errorf(
			"esperava unidade mercearia kg, recebeu %s",
			item.UnidadeMercearia,
		)
	}

	if item.UnidadeDepartamento != "g" {
		t.Errorf(
			"esperava unidade departamento g, recebeu %s",
			item.UnidadeDepartamento,
		)
	}

	if item.FatorConversao != 1000 {
		t.Errorf(
			"esperava fator de conversão 1000, recebeu %.4f",
			item.FatorConversao,
		)
	}

	totalEsperado := 3000.0

	if item.TotalLancado != totalEsperado {
		t.Errorf(
			"esperava TotalLancado %.2f, recebeu %.2f",
			totalEsperado,
			item.TotalLancado,
		)
	}
}

func TestCriarLancamentoErros(t *testing.T) {

	produtoMRepo := &produtoMerceariaRepositoryMock{}
	produtoDRepo := &produtoDepartamentoRepositoryMock{}
	lancamentoRepo := &lancamentoRepositoryMock{}

	service := NovoLancamentoService(
		lancamentoRepo,
		produtoMRepo,
		produtoDRepo,
	)

	tests := []struct {
		nome     string
		request  *request.LancamentoRequest
		mensagem string
	}{
		{
			nome: "departamento inválido",
			request: &request.LancamentoRequest{
				Tipo:           "QUEBRA",
				DepartamentoID: 0,
				Itens: []request.LancamentoItem{
					{
						Quantidade: 1,
					},
				},
			},
			mensagem: "departamento inválido",
		},

		{
			nome: "sem itens",
			request: &request.LancamentoRequest{
				Tipo:           "QUEBRA",
				DepartamentoID: 1,
				Itens:          []request.LancamentoItem{},
			},
			mensagem: "o lançamento deve possuir pelo menos um item",
		},

		{
			nome: "tipo inválido",
			request: &request.LancamentoRequest{
				Tipo:           "TIPO_INVALIDO",
				DepartamentoID: 1,
				Itens: []request.LancamentoItem{
					{
						Quantidade: 1,
					},
				},
			},
			mensagem: "tipo de lançamento inválido",
		},

		{
			nome: "quebra sem produto",
			request: &request.LancamentoRequest{
				Tipo:           "QUEBRA",
				DepartamentoID: 1,
				Itens: []request.LancamentoItem{
					{
						Quantidade: 1,
					},
				},
			},
			mensagem: "quebra exige produto da mercearia ou do departamento",
		},

		{
			nome: "quantidade inválida",
			request: &request.LancamentoRequest{
				Tipo:           "QUEBRA",
				DepartamentoID: 1,
				Itens: []request.LancamentoItem{
					{
						ProdutoMerceariaID: ptrInt(10),
						Quantidade:         0,
					},
				},
			},
			mensagem: "quantidade deve ser maior que 0",
		},

		{
			nome: "transferência sem produto mercearia",
			request: &request.LancamentoRequest{
				Tipo:           "TRANSFERENCIA",
				DepartamentoID: 1,
				Itens: []request.LancamentoItem{
					{
						ProdutoDepartamentoID: ptrInt(20),
						Quantidade:            1,
					},
				},
			},
			mensagem: "transferência exige produto da mercearia",
		},

		{
			nome: "transferência sem produto departamento",
			request: &request.LancamentoRequest{
				Tipo:           "TRANSFERENCIA",
				DepartamentoID: 1,
				Itens: []request.LancamentoItem{
					{
						ProdutoMerceariaID: ptrInt(10),
						Quantidade:         1,
					},
				},
			},
			mensagem: "transferência exige produto do departamento",
		},
	}

	for _, test := range tests {
		t.Run(test.nome, func(t *testing.T) {
			esperarErro(
				t,
				service,
				test.request,
				test.mensagem,
			)
		})
	}
}

func esperarErro(t *testing.T, service *LancamentoService, req *request.LancamentoRequest, mensagem string) {
	t.Helper()

	resultado, err := service.Criar(req, 1)

	if err == nil {
		t.Fatalf(
			"esperava erro %q, mas não recebeu nenhum",
			mensagem,
		)
	}

	if resultado != nil {
		t.Errorf(
			"esperava resultado nil em caso de erro, mas recebeu: %+v",
			resultado,
		)
	}

	if err.Error() != mensagem {
		t.Errorf(
			"esperava erro %q, recebeu %q",
			mensagem,
			err.Error(),
		)
	}
}

func TestCriarTransferenciaErros(t *testing.T) {
	produtoMercearia := &models.ProdutoMercearia{
		ID:                  10,
		LojaID:              1,
		ProdutoGenericoID:   5,
		SKU:                 "ARROZ-001",
		Marca:               "Marca Teste",
		Descricao:           "Arroz teste",
		CodigoBarras:        "123456789",
		QuantidadeEmbalagem: 1,
		UnidadeMedida:       "kg",
		Ativo:               true,
	}

	produtoDepartamento := &models.ProdutoDepartamento{
		ID:                20,
		LojaID:            1,
		ProdutoGenericoID: 5,
		Nome:              "Arroz",
		Codigo:            "ARR-01",
		UnidadeMedida:     "g",
	}

	produtoDiferente := &models.ProdutoDepartamento{
		ID:                30,
		LojaID:            1,
		ProdutoGenericoID: 99,
		Nome:              "Feijão",
		Codigo:            "FEI-01",
		UnidadeMedida:     "g",
	}

	t.Run("produto mercearia não encontrado", func(t *testing.T) {
		repoM := &produtoMerceariaRepositoryMock{
			produto: nil,
			err:     errors.New("produto não encontrado"),
		}

		repoD := &produtoDepartamentoRepositoryMock{
			produto: produtoDepartamento,
		}

		service := NovoLancamentoService(
			&lancamentoRepositoryMock{},
			repoM,
			repoD,
		)

		req := &request.LancamentoRequest{
			Tipo:           "TRANSFERENCIA",
			DepartamentoID: 1,
			Itens: []request.LancamentoItem{
				{
					ProdutoMerceariaID:    &produtoMercearia.ID,
					ProdutoDepartamentoID: &produtoDepartamento.ID,
					Quantidade:            1,
				},
			},
		}

		esperarErro(
			t,
			service,
			req,
			"produto não encontrado",
		)
	})

	t.Run("produto departamento não encontrado", func(t *testing.T) {
		repoM := &produtoMerceariaRepositoryMock{
			produto: produtoMercearia,
		}

		repoD := &produtoDepartamentoRepositoryMock{
			produto: nil,
			err:     errors.New("produto não encontrado"),
		}

		service := NovoLancamentoService(
			&lancamentoRepositoryMock{},
			repoM,
			repoD,
		)

		req := &request.LancamentoRequest{
			Tipo:           "TRANSFERENCIA",
			DepartamentoID: 1,
			Itens: []request.LancamentoItem{
				{
					ProdutoMerceariaID:    &produtoMercearia.ID,
					ProdutoDepartamentoID: &produtoDepartamento.ID,
					Quantidade:            1,
				},
			},
		}

		esperarErro(
			t,
			service,
			req,
			"produto não encontrado",
		)
	})

	t.Run("produtos pertencem a produtos genericos diferentes", func(t *testing.T) {
		repoM := &produtoMerceariaRepositoryMock{
			produto: produtoMercearia,
		}

		repoD := &produtoDepartamentoRepositoryMock{
			produto: produtoDiferente,
		}

		service := NovoLancamentoService(
			&lancamentoRepositoryMock{},
			repoM,
			repoD,
		)

		req := &request.LancamentoRequest{
			Tipo:           "TRANSFERENCIA",
			DepartamentoID: 1,
			Itens: []request.LancamentoItem{
				{
					ProdutoMerceariaID:    &produtoMercearia.ID,
					ProdutoDepartamentoID: &produtoDiferente.ID,
					Quantidade:            1,
				},
			},
		}

		esperarErro(
			t,
			service,
			req,
			"produto mercearia e produto do departamento não pertencem ao mesmo produto base",
		)
	})

	t.Run("unidades de medida incompatíveis", func(t *testing.T) {
		produtoDepartamentoIncompativel := &models.ProdutoDepartamento{
			ID:                40,
			LojaID:            1,
			ProdutoGenericoID: 5,
			Nome:              "Arroz",
			Codigo:            "ARR-02",
			UnidadeMedida:     "ml",
		}

		repoM := &produtoMerceariaRepositoryMock{
			produto: produtoMercearia,
		}

		repoD := &produtoDepartamentoRepositoryMock{
			produto: produtoDepartamentoIncompativel,
		}

		service := NovoLancamentoService(
			&lancamentoRepositoryMock{},
			repoM,
			repoD,
		)

		req := &request.LancamentoRequest{
			Tipo:           "TRANSFERENCIA",
			DepartamentoID: 1,
			Itens: []request.LancamentoItem{
				{
					ProdutoMerceariaID:    &produtoMercearia.ID,
					ProdutoDepartamentoID: &produtoDepartamentoIncompativel.ID,
					Quantidade:            1,
				},
			},
		}

		esperarErro(
			t,
			service,
			req,
			"não é possível converter kg para ml",
		)
	})
}

func TestCalcularFatorConversao(t *testing.T) {
	testes := []struct {
		nome          string
		origem        string
		destino       string
		fatorEsperado float64
		deveDarErro   bool
	}{
		{
			nome:          "kg para g",
			origem:        "kg",
			destino:       "g",
			fatorEsperado: 1000,
		},
		{
			nome:          "g para kg",
			origem:        "g",
			destino:       "kg",
			fatorEsperado: 0.001,
		},
		{
			nome:          "l para ml",
			origem:        "l",
			destino:       "ml",
			fatorEsperado: 1000,
		},
		{
			nome:          "ml para l",
			origem:        "ml",
			destino:       "l",
			fatorEsperado: 0.001,
		},
		{
			nome:          "mesma unidade kg",
			origem:        "kg",
			destino:       "kg",
			fatorEsperado: 1,
		},
		{
			nome:          "mesma unidade g",
			origem:        "g",
			destino:       "g",
			fatorEsperado: 1,
		},
		{
			nome:          "mesma unidade l",
			origem:        "l",
			destino:       "l",
			fatorEsperado: 1,
		},
		{
			nome:          "mesma unidade ml",
			origem:        "ml",
			destino:       "ml",
			fatorEsperado: 1,
		},
		{
			nome:          "mesma unidade un",
			origem:        "un",
			destino:       "un",
			fatorEsperado: 1,
		},
		{
			nome:        "kg para ml invalido",
			origem:      "kg",
			destino:     "ml",
			deveDarErro: true,
		},
		{
			nome:        "g para ml invalido",
			origem:      "g",
			destino:     "ml",
			deveDarErro: true,
		},
		{
			nome:        "l para kg invalido",
			origem:      "l",
			destino:     "kg",
			deveDarErro: true,
		},
	}

	for _, teste := range testes {
		t.Run(teste.nome, func(t *testing.T) {
			fator, err := calcularFatorConversao(
				teste.origem,
				teste.destino,
			)

			if teste.deveDarErro {
				if err == nil {
					t.Fatalf(
						"esperava erro ao converter %s para %s",
						teste.origem,
						teste.destino,
					)
				}

				return
			}

			if err != nil {
				t.Fatalf(
					"não esperava erro, mas recebeu: %v",
					err,
				)
			}

			if fator != teste.fatorEsperado {
				t.Errorf(
					"esperava fator %.4f, recebeu %.4f",
					teste.fatorEsperado,
					fator,
				)
			}
		})
	}
}

func TestCriarErros(t *testing.T) {
	tests := []struct {
		nome    string
		request *request.LancamentoRequest
		erro    string
	}{
		{
			nome:    "request nulo",
			request: nil,
			erro:    "lançamento não informado",
		},
		{
			nome: "departamento inválido",
			request: &request.LancamentoRequest{
				Tipo:           "QUEBRA",
				DepartamentoID: 0,
				Itens: []request.LancamentoItem{
					{
						Quantidade: 1,
					},
				},
			},
			erro: "departamento inválido",
		},
		{
			nome: "sem itens",
			request: &request.LancamentoRequest{
				Tipo:           "QUEBRA",
				DepartamentoID: 1,
				Itens:          []request.LancamentoItem{},
			},
			erro: "o lançamento deve possuir pelo menos um item",
		},
		{
			nome: "tipo inválido",
			request: &request.LancamentoRequest{
				Tipo:           "INVALIDO",
				DepartamentoID: 1,
				Itens: []request.LancamentoItem{
					{
						Quantidade: 1,
					},
				},
			},
			erro: "tipo de lançamento inválido",
		},
	}

	// mocks
	lancamentoRepo := &lancamentoRepositoryMock{}
	produtoMRepo := &produtoMerceariaRepositoryMock{}
	produtoDRepo := &produtoDepartamentoRepositoryMock{}

	service := NovoLancamentoService(
		lancamentoRepo,
		produtoMRepo,
		produtoDRepo,
	)

	for _, tt := range tests {
		t.Run(tt.nome, func(t *testing.T) {
			resultado, err := service.Criar(tt.request)

			if err == nil {
				t.Fatalf("esperava erro, mas não recebeu")
			}

			if resultado != nil {
				t.Errorf("esperava response nil, recebeu %+v", resultado)
			}

			if err.Error() != tt.erro {
				t.Errorf(
					"esperava erro %q, recebeu %q",
					tt.erro,
					err.Error(),
				)
			}
		})
	}
}

func ptrInt(valor int) *int {
	return &valor
}
