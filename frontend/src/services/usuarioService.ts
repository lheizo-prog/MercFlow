import api from "./api";
import type { Usuario, UsuarioPayload, UsuarioUpdatePayload } from "../types/Usuario";

const usuarioService = {
  async listar() {
    const response = await api.get<Usuario[]>("/usuarios");
    return response.data;
  },

  async buscarPorId(id: number) {
    const response = await api.get<Usuario>(`/usuarios/${id}`);
    return response.data;
  },

  async criar(payload: UsuarioPayload): Promise<Usuario> {
    const response = await api.post<Usuario>("/usuarios", payload);
    return response.data;
  },

  async atualizar(id: number, payload: UsuarioUpdatePayload): Promise<Usuario> {
    const response = await api.put<Usuario>(`/usuarios/${id}`, payload);
    return response.data;
  },

  async excluir(id: number): Promise<{ mensagem: string }> {
    const response = await api.delete<{ mensagem: string }>(`/usuarios/${id}`);
    return response.data;
  },
};

export default usuarioService;
