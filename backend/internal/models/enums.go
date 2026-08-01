package models

type UnidadeMedida string

type TipoLancamento string

const (
	TipoTransferencia TipoLancamento = "TRANSFERENCIA"
	TipoQuebra        TipoLancamento = "QUEBRA"
)

const (
	Un UnidadeMedida = "UN"
	Kg UnidadeMedida = "KG"
	Gr UnidadeMedida = "GR"
	L UnidadeMedida = "L"
	Ml UnidadeMedida = "ML"
)

func (u UnidadeMedida)Valido() bool{
	switch u{
	case Un, Kg, Gr, L, Ml:
		return true
	}
	return false
}