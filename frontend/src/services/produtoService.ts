import API_URL from "./api";

const produtoService = {
  async buscarTodos() {
    const response = await fetch(`${API_URL}/produto`);
    if (!response.ok) {
      throw new Error("Erro ao buscar produtos");
    }
    const produtos = await response.json();
    return produtos;
  },
};

export default produtoService;
