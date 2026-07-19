import { useEffect, useState } from "react";
import produtoService from "../../services/produtoService";
import type { Produto } from "../../types/Produto";
import TabelaProdutos from "../../components/TabelaProdutos/TabelaProdutos";
import ProdutoModal from "../../components/ProdutoModal/ProdutoModal";

function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState<
    Produto | undefined
  >();

  const [pesquisa, setPesquisa] = useState("");

  async function carregarProdutos() {
    try {
      setLoading(true);

      const lista = await produtoService.buscarTodos();

      setProdutos(lista);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarProdutos();
  }, []);

  async function criarProduto(produto: Produto) {
    try {
      await produtoService.criar(produto);

      await carregarProdutos();

      setMostrarModal(false);
    } catch (error) {
      console.error(error);
    }
  }

  async function atualizarProduto(produto: Produto) {
    try {
      await produtoService.atualizar(produto);

      await carregarProdutos();

      setProdutoSelecionado(undefined);
      setMostrarModal(false);
    } catch (error) {
      console.error(error);
    }
  }

  async function excluirProduto(id: number) {
    const confirmar = window.confirm("Deseja realmente excluir este produto?");

    if (!confirmar) {
      return;
    }

    try {
      await produtoService.excluir(id);

      await carregarProdutos();
    } catch (error) {
      console.error(error);
    }
  }

  function abrirNovoProduto() {
    setProdutoSelecionado(undefined);
    setMostrarModal(true);
  }

  function editarProduto(produto: Produto) {
    setProdutoSelecionado(produto);
    setMostrarModal(true);
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Produtos</h1>

        <button className="btn btn-primary" onClick={abrirNovoProduto}>
          Novo Produto
        </button>
      </div>

      <ProdutoModal
        aberto={mostrarModal}
        produto={produtoSelecionado}
        onFechar={() => {
          setMostrarModal(false);
          setProdutoSelecionado(undefined);
        }}
        onSalvar={produtoSelecionado ? atualizarProduto : criarProduto}
      />

      <div className="mb-4">
        <label className="form-label">Pesquisar Produto</label>

        <input
          className="form-control"
          placeholder="Digite nome ou código..."
          value={pesquisa}
          onChange={(e) => setPesquisa(e.target.value)}
        />
      </div>

      <TabelaProdutos
        produtos={produtos}
        onEditar={editarProduto}
        onExcluir={excluirProduto}
      />
    </div>
  );
}

export default ProdutosPage;
