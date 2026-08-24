import { useEffect, useState } from "react";

import produtoMerceariaService from "../../services/produtoMerceariaService";
import produtoService from "../../services/produtoGenericoService";

import type { ProdutoMercearia } from "../../types/ProdutoMercearia";
import type { ProdutoGenerico } from "../../types/ProdutoGenerico";

import ProdutoMerceariaModal from "../../components/produtomercearia/ProdutoMerceariaModal";
import TabelaProdutoMercearia from "../../components/produtomercearia/TabelaProdutoMercearia";

function ProdutoMerceariaPage() {
  const [produtosMercearia, setProdutosMercearia] = useState<
    ProdutoMercearia[]
  >([]);

  const [produtosGenericos, setProdutosGenericos] = useState<ProdutoGenerico[]>(
    [],
  );

  const [loading, setLoading] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] =
    useState<ProdutoMercearia>();

  const [pesquisa, setPesquisa] = useState("");

  async function carregarProdutosMercearia() {
    try {
      setLoading(true);

      const lista = await produtoMerceariaService.buscarTodos();

      console.log("Produtos Mercearia:", lista);

      setProdutosMercearia(lista);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function carregarProdutosBase() {
    try {
      const lista = await produtoService.buscarTodos();

      setProdutosGenericos(lista);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    carregarProdutosMercearia();
    carregarProdutosBase();
  }, []);

  async function limparPesquisa() {
    setPesquisa("");

    try {
      const lista = await produtoMerceariaService.buscarTodos();

      setProdutosMercearia(lista);
    } catch (error) {
      console.error(error);
    }
  }

  async function criarProdutoMercearia(produto: ProdutoMercearia) {
    try {
      await produtoMerceariaService.criar(produto);

      await carregarProdutosMercearia();

      setMostrarModal(false);
    } catch (error) {
      console.error(error);
    }
  }

  async function atualizarProdutoMercearia(produto: ProdutoMercearia) {
    try {
      await produtoMerceariaService.atualizar(produto);

      console.log("UPDATE - service terminou");

      await carregarProdutosMercearia();

      console.log("UPDATE - produtos recarregados");

      setMostrarModal(false);
      setProdutoSelecionado(undefined);

      console.log("UPDATE - modal fechado");
    } catch (error) {
      console.error("UPDATE - erro:", error);
    }
  }

  async function removerProdutoMercearia(id: number) {
    const confirmar = window.confirm(
      "Deseja realmente remover este produto da mercearia?",
    );
    if (!confirmar) return;

    try {
      await produtoMerceariaService.excluir(id);

      await carregarProdutosMercearia();

      setMostrarModal(false);
    } catch (error) {
      console.error(error);
    }
  }

  function abrirNovoProdutoMercearia() {
    setProdutoSelecionado(undefined);
    setMostrarModal(true);
  }

  function editarProdutoMercearia(produto: ProdutoMercearia) {
    setProdutoSelecionado(produto);
    setMostrarModal(true);
  }

  async function pesquisarProdutos(texto: string) {
    setPesquisa(texto);

    const termo = texto.trim();

    if (!termo) {
      await carregarProdutosMercearia();
      return;
    }

    try {
      const lista = await produtoMerceariaService.buscar(termo);

      setProdutosMercearia(lista);
    } catch (error) {
      console.error(error);
    }
  }

  const mapaProdutos = new Map(
    produtosGenericos.map((produto) => [produto.id, produto.nome]),
  );

  const produtosExibicao = produtosMercearia.map((produto) => ({
    ...produto,
    produto_generico_nome:
      produto.produto_generico_nome ??
      mapaProdutos.get(produto.produto_generico_id) ??
      "Produto não encontrado",
  }));

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="container-fluid px-0">
      {" "}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 border-bottom pb-3 mb-4">
        {" "}
        <div>
          <h1 className="h2 mb-1">Produtos da mercearia</h1>
          <p className="text-body-secondary mb-0">
            Gerencie SKUs, marcas e embalagens.
          </p>
        </div>
        <button className="btn btn-primary" onClick={abrirNovoProdutoMercearia}>
          Novo Produto
        </button>
      </div>
      <ProdutoMerceariaModal
        aberto={mostrarModal}
        produto={produtoSelecionado}
        produtosGenericos={produtosGenericos}
        onFechar={() => {
          setMostrarModal(false);
          setProdutoSelecionado(undefined);
        }}
        onSalvar={
          produtoSelecionado ? atualizarProdutoMercearia : criarProdutoMercearia
        }
      />
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <label
            className="form-label fw-semibold"
            htmlFor="pesquisa-produto-mercearia"
          >
            Pesquisar produto
          </label>
          <input
            id="pesquisa-produto-mercearia"
            className="form-control"
            placeholder="Digite SKU, marca, descrição ou código de barras..."
            value={pesquisa}
            onChange={(e) => {
              const texto = e.target.value;

              if (texto.trim() === "") {
                limparPesquisa();
                return;
              }

              pesquisarProdutos(texto);
            }}
          />
        </div>
      </div>
      <TabelaProdutoMercearia
        produtos={produtosExibicao}
        onEditar={editarProdutoMercearia}
        onExcluir={removerProdutoMercearia}
      />
    </div>
  );
}

export default ProdutoMerceariaPage;
