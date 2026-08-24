import { useEffect, useState } from "react";

import produtoDepartamentoService from "../../services/produtoDepartamentoService";
import produtoService from "../../services/produtoGenericoService";
import departamentoService from "../../services/departamentoService";

import type { ProdutoDepartamento } from "../../types/ProdutoDepartamento";
import type { ProdutoGenerico } from "../../types/ProdutoGenerico";
import type { Departamento } from "../../types/Departamento";

import ProdutoDepartamentoModal from "../../components/produtosdepartamento/ProdutoDepartamentoModal";
import TabelaProdutoDepartamento from "../../components/produtosdepartamento/TabelaProdutoDepartamento";

function ProdutoDepartamentoPage() {
  const [produtosDepartamento, setProdutosDepartamento] = useState<
    ProdutoDepartamento[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] =
    useState<ProdutoDepartamento>();

  const [pesquisa, setPesquisa] = useState("");
  const [produtosGenericos, setProdutosGenericos] = useState<ProdutoGenerico[]>(
    [],
  );
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);

  async function carregarProdutosDepartamento() {
    try {
      setLoading(true);

      const lista = await produtoDepartamentoService.buscarTodos();

      console.log("Produtos do Departamento:", lista);
      console.log(lista[0]);

      setProdutosDepartamento(lista);
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

  async function carregarDepartamentos() {
    try {
      const lista = await departamentoService.buscarTodos();
      setDepartamentos(lista);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    carregarProdutosDepartamento();
    carregarProdutosBase();
    carregarDepartamentos();
  }, []);

  async function criarProdutoDepartamento(produto: ProdutoDepartamento) {
    try {
      await produtoDepartamentoService.criar(produto);

      await carregarProdutosDepartamento();

      setMostrarModal(false);
    } catch (error) {
      console.error(error);
    }
  }

  async function atualizarProdutoDepartamento(produto: ProdutoDepartamento) {
    try {
      await produtoDepartamentoService.atualizar(produto);

      await carregarProdutosDepartamento();

      setMostrarModal(false);
    } catch (error) {
      console.error(error);
    }
  }

  async function removerProdutoDepartamento(id: number) {
    const confirmar = window.confirm(
      "Deseja realmente remover este produto do departamento?",
    );

    if (!confirmar) return;

    try {
      await produtoDepartamentoService.excluir(id);

      await carregarProdutosDepartamento();

      setMostrarModal(false);
    } catch (error) {
      console.error(error);
    }
  }

  function abrirNovoProdutoDepartamento() {
    setProdutoSelecionado(undefined);
    setMostrarModal(true);
  }

  function editarProdutoDepartamento(produto: ProdutoDepartamento) {
    setProdutoSelecionado(produto);
    setMostrarModal(true);
  }

  const produtosFiltrados = produtosDepartamento.filter((produto) => {
    const termo = pesquisa.trim().toLocaleLowerCase();

    if (!termo) return true;

    return (
      produto.nome.toLowerCase().includes(termo) ||
      produto.codigo.toLowerCase().includes(termo)
    );
  });

  const mapaProdutos = new Map(
    produtosGenericos.map((produto) => [produto.id, produto.nome]),
  );

  const mapaDepartamentos = new Map(
    departamentos.map((departamento) => [departamento.id, departamento.nome]),
  );

  const produtosExibicao = produtosFiltrados.map((produto) => ({
    ...produto,

    produto_generico_nome:
      mapaProdutos.get(produto.produto_generico_id) ?? "Produto não encontrado",

    departamento_nome:
      mapaDepartamentos.get(produto.departamento_id) ??
      "Departamento não encontrado",
  }));

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
          <h1 className="h2 mb-1">Produtos do departamento</h1>
          <p className="text-body-secondary mb-0">
            Associe itens aos setores da operação.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={abrirNovoProdutoDepartamento}
        >
          Novo Produto
        </button>
      </div>

      <ProdutoDepartamentoModal
        aberto={mostrarModal}
        produto={produtoSelecionado}
        produtosGenericos={produtosGenericos}
        departamentos={departamentos}
        onFechar={() => {
          setMostrarModal(false);
          setProdutoSelecionado(undefined);
        }}
        onSalvar={
          produtoSelecionado
            ? atualizarProdutoDepartamento
            : criarProdutoDepartamento
        }
      />

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <label
            className="form-label fw-semibold"
            htmlFor="pesquisa-produto-departamento"
          >
            Pesquisar produto
          </label>
          <input
            id="pesquisa-produto-departamento"
            className="form-control"
            placeholder="Digite nome ou código..."
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
          />
        </div>
      </div>

      <TabelaProdutoDepartamento
        produtos={produtosExibicao}
        onEditar={editarProdutoDepartamento}
        onExcluir={removerProdutoDepartamento}
      />
    </div>
  );
}

export default ProdutoDepartamentoPage;
