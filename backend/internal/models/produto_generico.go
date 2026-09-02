package models

type ProdutoGenerico struct {
	ID           int    `json:"id"`
	LojaID       int    `json:"loja_id"`
	Nome         string `json:"nome"`
	Codigo_Geral string `json:"codigo"`
}

func NovoProdutoGenerico(id int, nome, codigo_geral string) *ProdutoGenerico {
	return &ProdutoGenerico{
		ID:           id,
		Nome:         nome,
		Codigo_Geral: codigo_geral,
	}
}
