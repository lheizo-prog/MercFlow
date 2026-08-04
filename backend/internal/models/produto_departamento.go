package models

type ProdutoDepartamento struct {
	ID                  int           `json:"id"`
	ProdutoGenericoID   int           `json:"produto_generico_id"`
	ProdutoGenericoNome string        `json:"produto_generico_nome,omitempty"`
	DepartamentoID      int           `json:"departamento_id"`
	DepartamentoNome    string        `json:"departamento_nome,omitempty"`
	Nome                string        `json:"nome"`
	Codigo              string        `json:"codigo"`
	UnidadeMedida       UnidadeMedida `json:"unidade_medida"`
	Ativo               bool          `json:"ativo"`
}

func NovoProdutoDepartamento(id, departamentoID, produtoGenericoID, fatorConversao int, nome, codigo, produtoGenericoNome, departamentoNome string, unidade UnidadeMedida, ativo bool) *ProdutoDepartamento {
	return &ProdutoDepartamento{
		ID:                  id,
		ProdutoGenericoID:   produtoGenericoID,
		ProdutoGenericoNome: produtoGenericoNome,
		DepartamentoID:      departamentoID,
		DepartamentoNome:    departamentoNome,
		Nome:                nome,
		Codigo:              codigo,
		UnidadeMedida:       unidade,
		Ativo:               ativo,
	}
}