import api from "./api";
import type { Loja } from "../types/Loja";

const lojaService = {
  async listar(): Promise<Loja[]> {
    const response = await api.get<Loja[]>("/lojas");
    return response.data;
  },
};

export default lojaService;
