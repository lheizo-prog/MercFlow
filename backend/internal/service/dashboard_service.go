package service

import (
	"errors"
	"time"

	request "MercFlow/internal/models/requests"
	response "MercFlow/internal/models/response"
	"MercFlow/internal/repository/dashboard"
)

type DashboardService struct {
	dashboardRepo dashboard.DashboardRepository
}

func NovoDashboardService(
	dashboardRepo dashboard.DashboardRepository,
) *DashboardService {
	return &DashboardService{
		dashboardRepo: dashboardRepo,
	}
}

func (s *DashboardService) BuscarLancamentos(
	filtros *request.DashboardLancamentoRequest,
) (*response.DashboardLancamentoResponse, error) {

	if filtros == nil {
		return nil, errors.New("filtros do dashboard não informados")
	}

	if err := validarFiltrosDashboard(filtros); err != nil {
		return nil, err
	}

	return s.dashboardRepo.BuscarLancamentos(filtros)
}

func validarFiltrosDashboard(
	filtros *request.DashboardLancamentoRequest,
) error {

	if filtros.Tipo != "" &&
		filtros.Tipo != "QUEBRA" &&
		filtros.Tipo != "TRANSFERENCIA" {

		return errors.New("tipo de lançamento inválido")
	}

	if filtros.DataInicio != "" {
		if _, err := time.Parse("2006-01-02", filtros.DataInicio); err != nil {
			return errors.New("data inicial inválida")
		}
	}

	if filtros.DataFinal != "" {
		if _, err := time.Parse("2006-01-02", filtros.DataFinal); err != nil {
			return errors.New("data final inválida")
		}
	}

	if filtros.DataInicio != "" &&
		filtros.DataFinal != "" {

		dataInicio, _ := time.Parse(
			"2006-01-02",
			filtros.DataInicio,
		)

		dataFinal, _ := time.Parse(
			"2006-01-02",
			filtros.DataFinal,
		)

		if dataFinal.Before(dataInicio) {
			return errors.New(
				"data final não pode ser anterior à data inicial",
			)
		}
	}

	if filtros.DepartamentoID < 0 {
		return errors.New("departamento inválido")
	}

	if filtros.ProdutoID < 0 {
		return errors.New("produto inválido")
	}

	if filtros.ProdutoGenericoID < 0 {
		return errors.New("produto genérico inválido")
	}

	return nil
}
