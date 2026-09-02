package models

type LancamentoItem struct {
	ID                    int     `json:"id"`
	LancamentoID          int     `json:"lancamento_id"`
	ProdutoMerceariaID    *int    `json:"produto_m_id"`
	ProdutoDepartamentoID *int    `json:"produto_d_id"`
	Quantidade            float64 `json:"quantidade"`
}
