import { useEffect, useState } from "react";
import produtoService from "../../services/produtoGenericoService";
import type { ProdutoGenerico } from "../../types/ProdutoGenerico";
import TabelaProdutos from "../../components/produtogenerico/TabelaProdutos";
import ProdutoModal from "../../components/produtogenerico/ProdutoModal";

function ProdutosPage() {
  const [produtos, setProdutos] = useState<ProdutoGenerico[]>([]);
  const [loading, setLoading] = useState(true);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] =
    useState<ProdutoGenerico>();

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

  async function criarProduto(produto: ProdutoGenerico) {
    try {
      await produtoService.criar(produto);

      await carregarProdutos();

      setMostrarModal(false);
    } catch (error) {
      console.error(error);
    }
  }

  async function atualizarProduto(produto: ProdutoGenerico) {
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

    if (!confirmar) return;

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

  function editarProduto(produto: ProdutoGenerico) {
    setProdutoSelecionado(produto);
    setMostrarModal(true);
  }

  const produtosFiltrados = produtos.filter((produto) => {
    const termo = pesquisa.trim().toLowerCase();

    if (!termo) {
      return true;
    }

    return (
      produto.nome.toLowerCase().includes(termo) ||
      produto.codigo.toLowerCase().includes(termo) ||
      String(produto.id).includes(termo)
    );
  });

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
    <div className="container-fluid px-0">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 border-bottom pb-3 mb-4">
        <div>
          <h1 className="h2 mb-1">Produtos genéricos</h1>
          <p className="text-body-secondary mb-0">
            Base central de itens comercializados.
          </p>
        </div>

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

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <label
            className="form-label fw-semibold"
            htmlFor="pesquisa-produto-generico"
          >
            Pesquisar produto
          </label>
          <input
            id="pesquisa-produto-generico"
            className="form-control"
            placeholder="Digite ID, nome ou código..."
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
          />
        </div>
      </div>

      <TabelaProdutos
        produtos={produtosFiltrados}
        onEditar={editarProduto}
        onExcluir={excluirProduto}
      />
    </div>
  );
}

export default ProdutosPage;
