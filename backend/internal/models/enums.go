package models

import "strings"

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

func (u UnidadeMedida) Valido() bool {
	return u.Normalizado() != ""
}

func (u UnidadeMedida) Normalizado() UnidadeMedida {
	valor := strings.ToUpper(strings.TrimSpace(string(u)))

	switch valor {
	case "UN", "U", "UNIDADE":
		return Un
	case "KG", "KILO", "KILOGRAMA":
		return Kg
	case "G", "GR", "GRAMA":
		return Gr
	case "L", "LT", "LITRO":
		return L
	case "ML", "MILLILITRO":
		return Ml
	default:
		return ""
	}
}