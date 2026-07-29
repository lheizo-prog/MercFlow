export interface ProdutoDepartamento {
  id?: number;
  departamento_id: number;
  departamento_nome?: string;
  produto_base_id: number;
  produto_base_nome?: string;
  nome: string;
  codigo: string;
  unidade: string;
  fator_conversao: number;
}
