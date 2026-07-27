package models

type ProdutoDepartamento struct {
	ID             int    `json:"id"`
	DepartamentoID int    `json:"departamento_id"`
	Nome           string `json:"nome"`
	Codigo         string `json:"codigo"`
	UnidadeMedida  string `json:"unidade_medida"`
}

func NovoProdutoDepartamento(id, departamentoID int, nome, codigo, unidade string) *ProdutoDepartamento {
	return &ProdutoDepartamento{
		ID:             id,
		DepartamentoID: departamentoID,
		Nome:           nome,
		Codigo:         codigo,
		UnidadeMedida:  unidade,
	}
}