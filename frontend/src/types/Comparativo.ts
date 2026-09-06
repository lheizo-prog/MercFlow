export type RankingItem = DashboardLancamentoRankingItem;

import type { DashboardLancamentoRankingItem } from "./Dashboard";
export interface ComparativoLojaSelecionada {
  id: number;
  nome: string;
}

export interface ComparativoRange {
  dataInicio: string;
  dataFim: string;
}

export type ComparativoModo = "duas_lojas" | "mesma_loja";
export type ComparativoTipo = "" | "QUEBRA" | "TRANSFERENCIA";

export interface ComparativoDuasLojasConfig {
  modo: "duas_lojas";
  tipo: ComparativoTipo;
  usarDatasIguais: boolean;
  lojaA: ComparativoLojaSelecionada;
  lojaB: ComparativoLojaSelecionada;
  rangeA: ComparativoRange;
  rangeB: ComparativoRange;
}

export interface ComparativoMesmaLojaConfig {
  modo: "mesma_loja";
  tipo: ComparativoTipo;
  usarDatasIguais: false;
  loja: ComparativoLojaSelecionada;
  rangeA: ComparativoRange;
  rangeB: ComparativoRange;
}

export type ComparativoConfig = ComparativoDuasLojasConfig | ComparativoMesmaLojaConfig;

export interface ComparativoLojaData {
  loja_id: number;
  loja_nome: string;
  tipo: string;
  range: ComparativoRange;
  resumo: { total_quantidade: number; quantidade_registros: number };
  ranking: DashboardLancamentoRankingItem[];
  produtos_distintos: number;
  loading: boolean;
  error: string | null;
}


