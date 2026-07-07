package models

type Lancamento struct {
	ID         int
	Tipo       TipoLancamento
	Setor      Departamento
	Produto    Produto
	Quantidade float64
}

func NovoLancamento(id int, tipo TipoLancamento, setor Departamento, produto Produto, quantidade float64) *Lancamento {
	return &Lancamento{
		ID:         id,
		Tipo:       tipo,
		Setor:      setor,
		Produto:    produto,
		Quantidade: quantidade,
	}
}