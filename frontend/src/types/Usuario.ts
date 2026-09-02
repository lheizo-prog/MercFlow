export interface Usuario {
  id?: number;
  nome: string;
  username: string;
  senha_hash?: string;
  loja_id: number;
  perfil: "admin" | "operador" | "visualizador" | string;
  permissoes: string[];
  ativo?: boolean;
  criado_em?: string;
}

export interface UsuarioPayload {
  nome: string;
  username: string;
  senha: string;
  loja_id: number;
  perfil: string;
  permissoes: string[];
}
