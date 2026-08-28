package request

type DashboardLancamentoRequest struct {
	Tipo              string `form:"tipo"`
	DataInicio        string `form:"data_inicio"`
	DataFinal         string `form:"data_fim"`
	DepartamentoID    int    `form:"departamento_id"`
	ProdutoID         int    `form:"produto_id"`
	ProdutoGenericoID int    `form:"produto_generico_id"`
}