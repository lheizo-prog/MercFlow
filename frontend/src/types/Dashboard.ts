import { z } from "zod";

export const DashboardLancamentoFiltrosSchema = z.object({
  tipo: z.enum(["QUEBRA", "TRANSFERENCIA"]).optional(),
  data_inicio: z.string().optional(),
  data_fim: z.string().optional(),
  departamento_id: z.number().optional(),
  produto_id: z.number().optional(),
  produto_generico_id: z.number().optional(),
  loja_ids: z.string().optional(),
});

export type DashboardLancamentoFiltros = z.infer<typeof DashboardLancamentoFiltrosSchema>;

export const DashboardLancamentoResumoSchema = z.object({
  total_quantidade: z.number(),
  quantidade_registros: z.number(),
});

export type DashboardLancamentoResumo = z.infer<typeof DashboardLancamentoResumoSchema>;

export const DashboardLancamentoRankingItemSchema = z.object({
  produto_id: z.number(),
  produto_generico_id: z.number(),
  produto: z.string(),
  quantidade: z.number(),
  unidade: z.string(),
});

export type DashboardLancamentoRankingItem = z.infer<typeof DashboardLancamentoRankingItemSchema>;

export const DashboardLancamentoResponseSchema = z.object({
  filtros: DashboardLancamentoFiltrosSchema,
  resumo: DashboardLancamentoResumoSchema,
  ranking: DashboardLancamentoRankingItemSchema.array(),
});

export type DashboardLancamentoResponse = z.infer<typeof DashboardLancamentoResponseSchema>;


export interface DashboardLojaData {
  loja_id: number;
  loja_nome: string;
  total_quantidade: number;
  quantidade_registros: number;
  produtos_distintos: number;
}
