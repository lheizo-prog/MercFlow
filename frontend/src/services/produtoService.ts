import type { Produto } from "../types/Produto";
import api from "./api";

const produtoService = {
  async buscarTodos() {
    const response = await api.get<Produto[]>("/produtos");

    return response.data;
  },

  async criar(produto: Produto): Promise<Produto> {
    const response = await api.post("/produtos", produto);

    return response.data;
  },

  async atualizar(produto: Produto): Promise<Produto> {
    const response = await api.put(`/produtos/id/${produto.id}`);

    return response.data;
  },

  async excluir(produto: Produto): Promise<void> {
    await api.delete(`/produto/id/${produto.id}`);
  },
};

export default produtoService;
