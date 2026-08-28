export interface DashboardLancamentoFiltros {
  tipo?: "QUEBRA" | "TRANSFERENCIA";
  data_inicio?: string;
  data_fim?: string;
  departamento_id?: number;
  produto_id?: number;
  produto_generico_id?: number;
}

export interface DashboardLancamentoResumo {
  total_quantidade: number;
  quantidade_registros: number;
}

export interface DashboardLancamentoRankingItem {
  produto_id: number;
  produto_generico_id: number;
  produto: string;
  quantidade: number;
  unidade: string;
}

export interface DashboardLancamentoResponse {
  filtros: {
    tipo: string;
    data_inicio: string;
    data_fim: string;
    departamento_id: number;
    produto_id: number;
    produto_generico_id: number;
  };
  resumo: DashboardLancamentoResumo;
  ranking: DashboardLancamentoRankingItem[];
}
