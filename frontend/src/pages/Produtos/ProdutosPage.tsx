import { useEffect, useState } from "react";
import produtoService from "../../services/produtoService";
import type { Produto } from "../../types/Produto";
import TabelaProdutos from "../../components/TabelaProdutos/TabelaProdutos";
import ProdutoModal from "../../components/ProdutoModal/ProdutoModal";

function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [pesquisa, setPesquisa] = useState("");
  const [produtoSelecionado, setProdutoSelecionado] = useState<
    Produto | undefined
  >();

  async function carregarProdutos() {
    try {
      setLoading(true);
      const lista = await produtoService.buscarTodos();
      setProdutos(lista);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    carregarProdutos();
  }, []);

  async function criarProduto(produto: Produto) {
    await produtoService.criar(produto);

    await carregarProdutos();
  }
  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <div className="spinner-border" role="status">
          <span> Carregando... </span>
        </div>
      </div>
    );
  }
  return (
    <>
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1>Produtos</h1>
          <button
            className="btn btn-primary"
            onClick={() => setMostrarModal(true)}
          >
            Novo Produto
          </button>
        </div>
        <ProdutoModal
          aberto={mostrarModal}
          produto={produtoSelecionado}
          onFechar={() => setMostrarModal(false)}
          onSalvar={criarProduto}
        />
        <div className="mt-4">
          <label className="form-label">Pesquisar Produto</label>
          <input
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
          />
        </div>
        <TabelaProdutos produtos={produtos} />
      </div>
    </>
  );
}

export default ProdutosPage;
