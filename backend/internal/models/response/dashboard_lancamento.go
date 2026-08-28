package response

type DashboardLancamentoResponse struct {
	Filtros DashboardLancamentoFiltrosReponse `json:"filtros"`
	Resumo  DashboardLancamentoResumoResponse `json:"resumo"`
	Ranking []DashboardLancamentoRankingItem  `json:"ranking"`
}

type DashboardLancamentoFiltrosReponse struct {
	Tipo              string `json:"tipo"`
	DataInicio        string `json:"data_inicio"`
	DataFim           string `json:"data_fim"`
	DepartamentoID    int    `json:"departamento_id,omitempty"`
	ProdutoID         int    `json:"produto_id,omitempty"`
	ProdutoGenericoID int    `json:"produto_generico_id,omitempty"`
}

type DashboardLancamentoResumoResponse struct {
	TotalQuantidade     float64 `json:"total_quantidade"`
	QuantidadeRegistros int     `json:"quantidade_registros"`
}

type DashboardLancamentoRankingItem struct {
	ProdutoID         int     `json:"produto_id"`
	ProdutoGenericoID int     `json:"produto_generico_id"`
	Produto           string  `json:"produto"`
	Quantidade        float64 `json:"quantidade"`
	Unidade           string  `json:"unidade"`
}
