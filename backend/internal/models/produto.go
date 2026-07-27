package models

type ProdutoDepartamento struct{
	ID int `json:"id"`
	DepartamentoID int `json:"departamento_id"`
	Nome string `json:"nome"`
	Codigo string `json:"codigo"`
	UnidadeMedida string `json:"unidade_medida"`
}

type Produto struct {
	ID           int `json:"id"`
	Nome         string `json:"nome"`
	Codigo_Geral string `json:"codigo"`
}

func NovoProduto(id int, nome, codigo_geral string) *Produto {
	return &Produto{
		ID:           id,
		Nome:         nome,
		Codigo_Geral: codigo_geral,
	}
}

func NovoProdutoDepartamento(id, departamentoID int, nome, codigo, unidade string) *ProdutoDepartamento{
	return &ProdutoDepartamento{
		ID: id,
		DepartamentoID: departamentoID,
		Nome: nome,
		Codigo: codigo,
		UnidadeMedida: unidade,
	}
}