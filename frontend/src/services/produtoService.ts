import API_URL from "./api";
import type { Produto } from "../types/Produto";

const produtoService = {
  async buscarTodos() {
    const response = await fetch(`${API_URL}/produtos`);
    if (!response.ok) {
      throw new Error("Erro ao buscar produtos");
    }
    const produtos = await response.json();
    return produtos;
  },

  async criar(produto: Produto) {
    const response = await fetch(`${API_URL}/produtos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(produto),
    });
    if (!response.ok) {
      throw new Error("Não foi possível criar o produto");
    }
  },
};

export default produtoService;
