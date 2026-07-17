import api from "./api";
import type { Produto } from "../types/Produto";

const produtoService = {
  async buscarTodos(): Promise<Produto[]> {
    const response = await api.get("/produtos");
    return response.data;
  },

  async criar(produto: Produto): Promise<Produto> {
    const response = await api.post("/produtos", produto);
    return response.data;
  },
};

export default produtoService;
