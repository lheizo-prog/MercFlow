package models

type ProdutoMercearia struct {
	ID                  int           `json:"id"`
	LojaID              int           `json:"loja_id"`
	ProdutoGenericoID   int           `json:"produto_generico_id"`
	ProdutoGenericoNome string        `json:"produto_generico_nome,omitempty"`
	SKU                 string        `json:"sku"`
	Marca               string        `json:"marca"`
	Descricao           string        `json:"descricao"`
	CodigoBarras        string        `json:"codigo_barras"`
	QuantidadeEmbalagem float64       `json:"quantidade_embalagem"`
	UnidadeMedida       UnidadeMedida `json:"unidade_medida"`
	Ativo               bool          `json:"ativo"`
}
