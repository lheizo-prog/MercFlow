package models

type ProdutoDepartamento struct {
	ID                int           `json:"id"`
	ProdutoGenericoID int           `json:"produto_generico_id"`
	DepartamentoID    int           `json:"departamento_id"`
	Nome              string        `json:"nome"`
	Codigo            string        `json:"codigo"`
	UnidadeMedida     UnidadeMedida `json:"unidade_medida"`
	FatorConversao    int           `json:"fator_conversao"`
	Ativo             bool          `json:"ativo"`
}

func NovoProdutoDepartamento(id, departamentoID, produtoGenericoID, fatorConversao int, nome, codigo string, unidade UnidadeMedida, ativo bool) *ProdutoDepartamento {
	return &ProdutoDepartamento{
		ID:                id,
		ProdutoGenericoID: produtoGenericoID,
		DepartamentoID:    departamentoID,
		Nome:              nome,
		Codigo:            codigo,
		UnidadeMedida:     unidade,
		FatorConversao:    fatorConversao,
		Ativo:             ativo,
	}
}