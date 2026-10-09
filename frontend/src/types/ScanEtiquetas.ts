import type { ProdutoMercearia } from "./ProdutoMercearia";
import type { ProdutoDepartamento } from "./ProdutoDepartamento";

export interface SugestaoProdutoMercearia {
  produto: ProdutoMercearia;
  score: number;
  motivo: string;
}

export interface ScanItemResponse {
  label_index: number;
  status: "IDENTIFICADO" | "SUGESTAO" | "NAO_ENCONTRADO";
  codigo_lido: string;
  confianca: number;
  produto_mercearia?: ProdutoMercearia;
  produto_departamento_sugerido?: ProdutoDepartamento;
  sugestoes?: SugestaoProdutoMercearia[];
}

export interface ScanEtiquetasResponse {
  total_detectados: number;
  total_identificados: number;
  itens: ScanItemResponse[];
}
