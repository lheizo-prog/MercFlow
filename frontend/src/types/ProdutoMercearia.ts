export interface ProdutoMercearia {
  id?: number;
  produto_generico_id: number;
  produto_generico_nome?: string;
  sku: string;
  marca: string;
  descricao: string;
  codigo_barras: string;
  quantidade_embalagem: number;
  unidade_medida: string;
  ativo?: boolean;
}
