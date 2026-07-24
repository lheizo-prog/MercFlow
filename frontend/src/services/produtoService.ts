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
    const response = await api.put<Produto>(
      `/produtos/id/${produto.id}`,
      produto,
    );

    return response.data;
  },

  async excluir(id: number): Promise<void> {
    return api.delete(`/produtos/id/${id}`);
  },
};

export default produtoService;
