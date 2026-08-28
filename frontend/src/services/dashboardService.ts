import api from "./api";
import type {
  DashboardLancamentoFiltros,
  DashboardLancamentoResponse,
} from "../types/Dashboard";

const dashboardService = {
  async buscarLancamentos(
    filtros: DashboardLancamentoFiltros,
  ): Promise<DashboardLancamentoResponse> {
    const response = await api.get<DashboardLancamentoResponse>(
      "/dashboard/lancamentos",
      { params: filtros },
    );

    return response.data;
  },
};

export default dashboardService;
