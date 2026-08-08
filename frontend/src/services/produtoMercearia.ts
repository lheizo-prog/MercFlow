import axios from "axios";
import type { ProdutoMercearia } from "../types/ProdutoMercearia";
import api from "./api";

const produtoMerceariaService = {
  async buscarTodos(): Promise<ProdutoMercearia[]> {
    const response = await api.get<ProdutoMercearia[]>("/produtos_m");

    return response.data;
  },

  async criar(produto: ProdutoMercearia): Promise<ProdutoMercearia> {
    const response = await api.post<ProdutoMercearia>("/produtos_m", produto);

    console.log("Produto Mercearia criado:", response.data);

    return response.data;
  },

  async atualizar(produto: ProdutoMercearia): Promise<ProdutoMercearia> {
    console.log("SERVICE UPDATE:", produto);

    try {
      const response = await api.put<ProdutoMercearia>(
        `/produtos_m/id/${produto.id}`,
        produto,
      );

      console.log("SERVICE RESPONSE:", response.data);

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("STATUS:", error.response?.status);
        console.error("BACKEND:", error.response?.data);
      } else {
        console.error("SERVICE ERROR:", error);
      }

      throw error;
    }
  },

  async excluir(id: number) {
    return api.delete(`/produtos_m/id/${id}`);
  },

  async buscarID(id: number): Promise<ProdutoMercearia> {
    const response = await api.get<ProdutoMercearia>(`/produtos_m/${id}`);

    return response.data;
  },

  async buscarSKU(sku: string): Promise<ProdutoMercearia> {
    const response = await api.get<ProdutoMercearia>(
      `/produtos_m/sku/${encodeURIComponent(sku)}`,
    );

    return response.data;
  },

  async buscarCodigoBarras(codigo: string): Promise<ProdutoMercearia> {
    const response = await api.get<ProdutoMercearia>(
      `/produtos_m/codigo/${encodeURIComponent(codigo)}`,
    );

    return response.data;
  },

  async buscar(texto: string): Promise<ProdutoMercearia[]> {
    const response = await api.get<ProdutoMercearia[]>(
      `/produtos_m/buscar/${encodeURIComponent(texto)}`,
    );

    return response.data;
  },
};

export default produtoMerceariaService;
