package models

import "time"

type Lancamento struct {
	ID         int `json:"id"`
	Data       time.Time `json:"data"`
	Tipo       TipoLancamento `json:"tipo"`
	Itens []*ItemLancamento `json:"itens"`
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