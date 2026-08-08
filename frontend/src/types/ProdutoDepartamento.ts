export interface ProdutoDepartamento {
  id?: number;
  departamento_id: number;
  departamento_nome?: string;
  produto_generico_id: number;
  produto_generico_nome?: string;
  nome: string;
  codigo: string;
  unidade_medida: string;
  ativo?: boolean;
}
