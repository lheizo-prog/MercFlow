package models

type ProdutoDepartamento struct {
	ID             int           `json:"id"`
	ProdutoBaseID  int           `json:"produto_base_id"`
	DepartamentoID int           `json:"departamento_id"`
	Nome           string        `json:"nome"`
	Codigo         string        `json:"codigo"`
	UnidadeMedida  UnidadeMedida `json:"unidade_medida"`
	FatorConversao int           `json:"fator_conversao"`
	Ativo          bool          `json:"ativo"`
}

func NovoProdutoDepartamento(id, departamentoID, produtoBaseID, fatorConversao int, nome, codigo string, unidade UnidadeMedida, ativo bool) *ProdutoDepartamento {
	return &ProdutoDepartamento{
		ID:             id,
		ProdutoBaseID:  produtoBaseID,
		DepartamentoID: departamentoID,
		Nome:           nome,
		Codigo:         codigo,
		UnidadeMedida:  unidade,
		FatorConversao: fatorConversao,
		Ativo:          ativo,
	}
}