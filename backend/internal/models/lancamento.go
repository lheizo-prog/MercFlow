package models

import "time"

type Lancamento struct {
	ID             int            `json:"id"`
	LojaID         int            `json:"loja_id"`
	Tipo           TipoLancamento `json:"tipo"`
	DepartamentoID int            `json:"departamento_id"`
	Data           time.Time      `json:"data_lancamento"`
	Observacao     *string        `json:"observacao,omitempty"`

	Itens []LancamentoItem `json:"itens"`
}
