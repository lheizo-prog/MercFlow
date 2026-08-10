package request

import "MercFlow/internal/models"

type LancamentoRequest struct{
	Tipo models.TipoLancamento `json:"tipo"`
	DepartamentoID int `json:"departamento_id"`
	Observacao *string `json:"observacao,omitempty"`
	Itens []LancamentoItem `json:"itens"`
}

type LancamentoItem struct{
	ProdutoMerceariaID *int `json:"produto_mercearia_id,omitempty"`
	ProdutoDepartamentoID *int `json:"produto_departamento_id,omitempty"`
	Quantidade float64 `json:"quantidade"`
}
