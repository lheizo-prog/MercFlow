import type { ProdutoGenerico } from "../types/ProdutoGenerico";
import api from "./api";

const produtoService = {
  async buscarTodos() {
    const response = await api.get<ProdutoGenerico[]>("/produtos_g");

    return response.data;
  },

  async criar(produto: ProdutoGenerico): Promise<ProdutoGenerico> {
    const response = await api.post("/produtos_g", produto);

    return response.data;
  },

  async atualizar(produto: ProdutoGenerico): Promise<ProdutoGenerico> {
    const response = await api.put<ProdutoGenerico>(
      `/produtos_g/id/${produto.id}`,
      produto,
    );

    return response.data;
  },

  async excluir(id: number): Promise<void> {
    return api.delete(`/produtos_g/id/${id}`);
  },
};

export default produtoService;
