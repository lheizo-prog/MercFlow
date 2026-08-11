package service

import (
	"MercFlow/internal/models"
	request "MercFlow/internal/models/requests"
	"testing"
)

type produtoMerceariaRepositoryMock struct {
	produto *models.ProdutoMercearia
	err error
}

type produtoDepartamentoRepositoryMock struct{
	produto *models.ProdutoDepartamento
	err error
}

type lancamentoRepositoryMock struct{
	lancamento *models.Lancamento
	err error
}

//Produto mercearia
func (m *produtoMerceariaRepositoryMock)Criar(p *models.ProdutoMercearia) (*models.ProdutoMercearia, error){
	return m.produto, m.err
}
func (m *produtoMerceariaRepositoryMock)Atualizar(p *models.ProdutoMercearia) (*models.ProdutoMercearia, error){
	return m.produto, m.err
}
func (m *produtoMerceariaRepositoryMock)Listar() ([]*models.ProdutoMercearia, error){
	return nil, m.err
}
func (m *produtoMerceariaRepositoryMock)RemoverID(id int) error{
	return m.err
}
func (m *produtoMerceariaRepositoryMock)BuscarID(id int) (*models.ProdutoMercearia, error){
	return m.produto, m.err
}
func (m *produtoMerceariaRepositoryMock)BuscarSKU(sku string) (*models.ProdutoMercearia, error){
	return m.produto, m.err
}
func (m *produtoMerceariaRepositoryMock)BuscarCodigoBarras(codigo string) (*models.ProdutoMercearia, error){
	return m.produto, m.err
}
func (m *produtoMerceariaRepositoryMock)Buscar(texto string) ([]*models.ProdutoMercearia, error){
	return nil, m.err
}
func (m *produtoMerceariaRepositoryMock)BuscarInativo(sku string) (*models.ProdutoMercearia, error){
	return m.produto, m.err
}
func (m *produtoMerceariaRepositoryMock)Reativar(id int) error{
	return m.err
}


//Produto departamento
func (d *produtoDepartamentoRepositoryMock)Criar(p *models.ProdutoDepartamento) (*models.ProdutoDepartamento, error){
	return d.produto, d.err
}
func (d *produtoDepartamentoRepositoryMock)Atualizar(p *models.ProdutoDepartamento) (*models.ProdutoDepartamento, error){
	return d.produto, d.err
}
func (d *produtoDepartamentoRepositoryMock)Listar() ([]*models.ProdutoDepartamento, error){
	return nil, d.err
}
func (d *produtoDepartamentoRepositoryMock)RemoverID(id int) error{
	return d.err
}
func (d *produtoDepartamentoRepositoryMock)BuscarID(id int) (*models.ProdutoDepartamento, error){
	return d.produto, d.err
}
func (d *produtoDepartamentoRepositoryMock)BuscarSKU(sku string) (*models.ProdutoDepartamento, error){
	return d.produto, d.err
}
func (d *produtoDepartamentoRepositoryMock)BuscarCodigo(codigo string) (*models.ProdutoDepartamento, error){
	return d.produto, d.err
}
func (d *produtoDepartamentoRepositoryMock)Buscar(texto string) ([]*models.ProdutoDepartamento, error){
	return nil, d.err
}
func (d *produtoDepartamentoRepositoryMock)BuscarInativo(departamentoID, produtoGenericoID int, codigo string) (*models.ProdutoDepartamento, error){
	return d.produto, d.err
}
func (d *produtoDepartamentoRepositoryMock)Reativar(id int) error{
	return d.err
}

//Lançamento
func (l *lancamentoRepositoryMock)Criar(lancamento *models.Lancamento) (*models.Lancamento, error){
	return l.lancamento, l.err
}
func (l *lancamentoRepositoryMock)BuscarID(id int) (*models.Lancamento, error){
	return l.lancamento, l.err
}
func (l *lancamentoRepositoryMock)Listar() ([]models.Lancamento, error){
	return nil, l.err
}

func TestCriarQuebraProdutoMercearia(t *testing.T) {

	produtoMercearia := &models.ProdutoMercearia{
		ID:                10,
		ProdutoGenericoID: 5,
		SKU:               "ARROZ-001",
		Marca:             "Marca Teste",
		Descricao:         "Arroz teste",
		CodigoBarras:      "123456789",
		QuantidadeEmbalagem: 1,
		UnidadeMedida:     "kg",
		Ativo:             true,
	}

	produtoMRepo := &produtoMerceariaRepositoryMock{
		produto: produtoMercearia,
	}

	produtoDRepo := &produtoDepartamentoRepositoryMock{}

	lancamentoRepo := &lancamentoRepositoryMock{}

	service := NovoLancamentoService(
		lancamentoRepo,
		produtoMRepo,
		produtoDRepo,
	)

	quantidade := 2.0

	req := &request.LancamentoRequest{
		Tipo:           "QUEBRA",
		DepartamentoID: 1,
		Itens: []request.LancamentoItem{
			{
				ProdutoMerceariaID:   &produtoMercearia.ID,
				ProdutoDepartamentoID: nil,
				Quantidade:            quantidade,
			},
		},
	}

	resultado, err := service.Criar(req)

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

