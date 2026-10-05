export interface Usuario {
  id?: number;
  nome: string;
  username: string;
  senha_hash?: string;
  loja_id: number;
  perfil: "super_admin" | "admin" | "operador" | "visualizador" | string;
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

export interface UsuarioUpdatePayload {
  nome: string;
  username: string;
  senha?: string;
  loja_id: number;
  perfil: string;
  permissoes: string[];
  ativo?: boolean;
}
