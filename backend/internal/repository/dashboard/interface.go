package dashboard

import (
	request "MercFlow/internal/models/requests"
	response "MercFlow/internal/models/response"
)

type DashboardRepository interface {
	BuscarLancamentos(filtros *request.DashboardLancamentoRequest) (*response.DashboardLancamentoResponse, error)
}
