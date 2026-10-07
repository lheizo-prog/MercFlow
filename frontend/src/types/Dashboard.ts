import { z } from "zod";

export const DashboardLancamentoFiltrosSchema = z.object({
  tipo: z.union([z.enum(["QUEBRA", "TRANSFERENCIA"]), z.literal(""), z.null()]).optional(),
  data_inicio: z.string().nullish(),
  data_fim: z.string().nullish(),
  departamento_id: z.coerce.number().nullish(),
  produto_id: z.coerce.number().nullish(),
  produto_generico_id: z.coerce.number().nullish(),
  loja_ids: z.string().nullish(),
}).passthrough();

export type DashboardLancamentoFiltros = z.infer<typeof DashboardLancamentoFiltrosSchema>;

export const DashboardLancamentoResumoSchema = z.object({
  total_quantidade: z.coerce.number().default(0),
  quantidade_registros: z.coerce.number().default(0),
}).passthrough();

export type DashboardLancamentoResumo = z.infer<typeof DashboardLancamentoResumoSchema>;

export const DashboardLancamentoRankingItemSchema = z.object({
  produto_id: z.coerce.number().default(0),
  produto_generico_id: z.coerce.number().default(0),
  produto: z.string().default(""),
  quantidade: z.coerce.number().default(0),
  unidade: z.string().default(""),
}).passthrough();

export type DashboardLancamentoRankingItem = z.infer<typeof DashboardLancamentoRankingItemSchema>;

export const DashboardLancamentoResponseSchema = z.object({
  filtros: DashboardLancamentoFiltrosSchema.default({}),
  resumo: DashboardLancamentoResumoSchema.default({ total_quantidade: 0, quantidade_registros: 0 }),
  ranking: DashboardLancamentoRankingItemSchema.array().default([]),
}).passthrough();

export type DashboardLancamentoResponse = z.infer<typeof DashboardLancamentoResponseSchema>;


export interface DashboardLojaData {
  loja_id: number;
  loja_nome: string;
  total_quantidade: number;
  quantidade_registros: number;
  produtos_distintos: number;
}
