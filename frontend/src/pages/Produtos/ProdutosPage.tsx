import { useEffect, useState } from "react";
import produtoService from "../../services/produtoService";
import type { Produto } from "../../types/Produto";
import TabelaProdutos from "../../components/TabelaProdutos/TabelaProdutos";
import ProdutoForm from "../../components/ProdutoForm/ProdutoForm";

function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  useEffect(() => {
    async function carregarProdutos() {
      try {
        const lista = await produtoService.buscarTodos();
        setProdutos(lista);
      } catch (error) {
        console.error(error);
      }
    }
    carregarProdutos();
  }, []);

  async function criarProduto(produto: Produto) {
    try {
      const produtoCriado = await produtoService.criar(produto);
      setProdutos((listaAtual) => [...listaAtual, produtoCriado]);
    } catch (error) {
      console.error(error);
    }
  }
  return (
    <>
      <div className="container">
        <h1>Produtos</h1>
        <ProdutoForm onSalvar={criarProduto} />
        <button className="btn btn-primary">Novo Produto</button>
        <div className="mt-4">
          <label className="form-label">Pesquisar Produto</label>
          <input
            type="text"
            className="form-control"
            placeholder="Digite ID, nome ou código..."
          />
        </div>
        <TabelaProdutos produtos={produtos} />
      </div>
    </>
  );
}

export default ProdutosPage;
