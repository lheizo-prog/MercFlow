import api from "./api";
import { DashboardLancamentoResponseSchema } from "../types/Dashboard";
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
    const result = DashboardLancamentoResponseSchema.safeParse(response.data);
    if (!result.success) {
      console.error("Invalid dashboard response:", result.error);
      throw new Error("Resposta inválida do servidor");
    }
    return result.data;
  },
};

export default dashboardService;
