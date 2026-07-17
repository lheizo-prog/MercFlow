package models

type Produto struct {
	ID           int `json:"id"`
	Nome         string `json:"nome"`
	Codigo_Geral string `json:"codigo"`
}

func CriarProduto(id int, nome, codigo_geral string) *Produto {
	return &Produto{
		ID:           id,
		Nome:         nome,
		Codigo_Geral: codigo_geral,
	}
}