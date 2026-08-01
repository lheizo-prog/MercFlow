import type { ProdutoDepartamento } from "../types/ProdutoDepartamento";
import api from "./api";

const produtoDService = {
  async buscarTodos() {
    const response = await api.get<ProdutoDepartamento[]>("/produtos_d");

    return response.data;
  },

  async criar(produto: ProdutoDepartamento): Promise<ProdutoDepartamento> {
    const response = await api.post("/produtos_d", produto);
    console.log("Produto criado:", response.data);
    return response.data;
  },

  async atualizar(produto: ProdutoDepartamento): Promise<ProdutoDepartamento> {
    const response = await api.put<ProdutoDepartamento>(
      `/produtos_d/id/${produto.id}`,
      produto,
    );

    return response.data;
  },

  async excluir(id: number): Promise<void> {
    return api.delete(`/produtos_d/id/${id}`);
  },
};

export default produtoDService;
