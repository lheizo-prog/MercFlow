package models

import "time"

type Lancamento struct {
	ID         int
	Data       time.Time
	Tipo       TipoLancamento
	Itens []*ItemLancamento
}

type ItemLancamento struct{
	Setor Departamento
	Produto Produto
	CodigoBase string
	CodigoSetor string
	Quantidade float64
}
func NovoLancamento(id int, tipo TipoLancamento, data time.Time, itens []*ItemLancamento) *Lancamento {
	return &Lancamento{
		ID:         id,
		Data:       data,
		Tipo:       tipo,
		Itens: itens,
	}
}