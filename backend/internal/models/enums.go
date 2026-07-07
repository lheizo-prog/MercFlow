package models

type TipoLancamento string

const (
	TipoTransferencia TipoLancamento = "TRANSFERENCIA"
	TipoQuebra        TipoLancamento = "QUEBRA"
)