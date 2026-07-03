package models

type Produto struct {
	ID           int
	Nome         string
	Codigo_Geral string
}

func CriarProduto(id int, nome, codigo_geral string) *Produto {
	return &Produto{
		ID:           id,
		Nome:         nome,
		Codigo_Geral: codigo_geral,
	}
}