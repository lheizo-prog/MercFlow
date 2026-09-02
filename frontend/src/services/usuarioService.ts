import api from "./api";
import type { Usuario, UsuarioPayload } from "../types/Usuario";

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
};

export default usuarioService;
