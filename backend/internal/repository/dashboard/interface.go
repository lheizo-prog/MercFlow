package dashboard

import (
	"context"

	request "MercFlow/internal/models/requests"
	response "MercFlow/internal/models/response"
)

type DashboardRepository interface {
	BuscarLancamentos(ctx context.Context, filtros *request.DashboardLancamentoRequest) (*response.DashboardLancamentoResponse, error)
}
