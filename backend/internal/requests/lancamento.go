package requests

import "MercFlow/internal/models"

type CriarLancamentoRequest struct{
	Tipo models.TipoLancamento `json:"tipo"`
	DepartamentoID int `json:"departamento_id"`
	Observacao *string `json:"observacao,omitempty"`
	Itens []CriarLancamentoItem `json:"itens"`
}

type CriarLancamentoItem struct{
	ProdutoMerceariaID *int `json:"produto_mercearia_id,omitempty"`
	ProdutoDepartamento *int `json:"produto_departamento_id,omitempty"`
	Quantidade float64 `json:"quantidade"`
}