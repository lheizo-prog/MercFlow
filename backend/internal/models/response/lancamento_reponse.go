package response

import "time"

type LancamentoResponse struct {
	ID             int    `json:"id"`
	DepartamentoID int    `json:"departamento_id"`
	Tipo           string `json:"tipo"`
	Data           time.Time `json:"Data"`
	Observacao     string `json:"observacao,omitempty"`

	Itens []LancamentoItemResponse `json:"itens"`
}

type LancamentoItemResponse struct{
	ProdutoMerceariaID int `json:"produto_mercearia_id"`
	ProdutoDepartamentoID int `json:"produto_departamento_id"`

	Quantidade float64 `json:"quantidade"`
	UnidadeMercearia string `json:"unidade_mercearia"`
	UnidadeDepartamento string `json:"unidade_departamento"`
	
	FatorConversao float64 `json:"fator_conversao"`
	TotalLancado float64 `json:"total_lancado"`
}