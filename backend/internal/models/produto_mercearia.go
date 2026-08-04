package models

type ProdutoMercearia struct {
	ID                      int           `json:"id"`
	ProdutoDepartamentoID   int           `json:"produto_departamento_id"`
	ProdutoDepartamentoNome string        `json:"produto_departamento_nome,omitempty"`
	SKU                     string        `json:"sku"`
	Marca                   string        `json:"marca"`
	Descricao               string        `json:"descricao"`
	CodigoBarras            string        `json:"codigo_barras"`
	QuantidadeEmbalagem     float64       `json:"quantidade_embalagem"`
	UnidadeMedida           UnidadeMedida `json:"unidade_medida"`
	Ativo                   bool          `json:"ativo"`
}