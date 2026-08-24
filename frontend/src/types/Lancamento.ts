export interface Lancamento {
  id?: number;
  departamentoID: number;
  tipo: string;
  data: Date;
  observacao?: string;
  itens: LancamentoItem[];
}

export interface LancamentoItem {
  produtoMerceariaID: number;
  produtoDepartamentoID: number;

  quantidade: number;
  unidadeMercearia: string;
  unidadeDepartamento: string;

  fatorConversao: number;
  totalLancado: number;
}

export interface LancamentoItemPayload {
  produtoMerceariaID: number;
  produtoDepartamentoID: number;
  quantidade: number;
}

export type LancamentoPayload = Omit<Lancamento, "itens"> & {
  itens: LancamentoItemPayload[];
};
