import { useCallback, useEffect, useState } from "react";

import produtoDepartamentoService from "../../services/produtoDepartamentoService";
import produtoService from "../../services/produtoGenericoService";
import departamentoService from "../../services/departamentoService";
import { useRefetchOnFocus } from "../../hooks/useRefetchOnFocus";

import type { ProdutoDepartamento } from "../../types/ProdutoDepartamento";
import type { ProdutoGenerico } from "../../types/ProdutoGenerico";
import type { Departamento } from "../../types/Departamento";

import ProdutoDepartamentoModal from "../../components/produtosdepartamento/ProdutoDepartamentoModal";
import TabelaProdutoDepartamento from "../../components/produtosdepartamento/TabelaProdutoDepartamento";
import TrocarProdutoBaseModal from "../../components/produtosdepartamento/TrocarProdutoBaseModal";

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

  // Estados para seleção em lote e troca de Produto Base
  const [idsSelecionados, setIdsSelecionados] = useState<number[]>([]);
  const [modalLoteAberto, setModalLoteAberto] = useState(false);
  const [salvandoLote, setSalvandoLote] = useState(false);
  const [feedbackLote, setFeedbackLote] = useState<{ tipo: "sucesso" | "erro"; texto: string } | null>(null);

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

  // Recarrega as três listas silenciosamente quando o usuário volta para
  // esta aba: sem isso, um produto genérico, departamento ou produto de
  // departamento criado/editado/excluído em outra aba ou sessão continuaria
  // aparecendo (ou faltando) aqui até um refresh manual da página.
  const recarregarEmSegundoPlano = useCallback(() => {
    produtoDepartamentoService
      .buscarTodos()
      .then(setProdutosDepartamento)
      .catch((error) => console.error(error));
    produtoService
      .buscarTodos()
      .then(setProdutosGenericos)
      .catch((error) => console.error(error));
    departamentoService
      .buscarTodos()
      .then(setDepartamentos)
      .catch((error) => console.error(error));
  }, []);

  useRefetchOnFocus(recarregarEmSegundoPlano);

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

  function handleToggleSelecionar(id: number) {
    setIdsSelecionados((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  function handleSelecionarTodos() {
    const idsVisiveis = produtosExibicao.map((p) => p.id!).filter(Boolean);
    const todosMarcados = idsVisiveis.length > 0 && idsVisiveis.every((id) => idsSelecionados.includes(id));

    if (todosMarcados) {
      // Desmarca todos que estão na visualização
      setIdsSelecionados((prev) => prev.filter((id) => !idsVisiveis.includes(id)));
    } else {
      // Adiciona todos os visíveis na seleção
      setIdsSelecionados((prev) => Array.from(new Set([...prev, ...idsVisiveis])));
    }
  }

  async function handleConfirmarTrocaBaseLote(novoProdutoGenericoId: number) {
    if (idsSelecionados.length === 0 || novoProdutoGenericoId <= 0) return;

    try {
      setSalvandoLote(true);
      const res = await produtoDepartamentoService.atualizarProdutoBaseEmLote(
        idsSelecionados,
        novoProdutoGenericoId
      );

      await carregarProdutosDepartamento();

      setFeedbackLote({
        tipo: "sucesso",
        texto: `${res.total_atualizados} ${
          res.total_atualizados === 1 ? "produto atualizado" : "produtos atualizados"
        } com o novo Produto Base com sucesso!`,
      });
      setIdsSelecionados([]);
      setModalLoteAberto(false);
    } catch (err: unknown) {
      console.error("Erro ao atualizar produtos base em lote:", err);
      setFeedbackLote({
        tipo: "erro",
        texto: "Não foi possível atualizar o produto base dos itens selecionados.",
      });
    } finally {
      setSalvandoLote(false);
    }
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

      {feedbackLote && (
        <div
          className={`alert ${
            feedbackLote.tipo === "sucesso" ? "alert-success" : "alert-danger"
          } alert-dismissible fade show d-flex align-items-center justify-content-between mb-4 border-0 shadow-sm`}
          role="alert"
        >
          <span>{feedbackLote.texto}</span>
          <button
            type="button"
            className="btn-close"
            onClick={() => setFeedbackLote(null)}
            aria-label="Close"
          ></button>
        </div>
      )}

      {/* Barra Flutuante de Ações em Lote */}
      {idsSelecionados.length > 0 && (
        <div
          className="alert bg-dark text-white border-0 shadow-lg d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 mb-4 py-2 px-3 rounded-3"
          style={{
            position: "sticky",
            top: "70px",
            zIndex: 1010,
          }}
        >
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-primary px-2 py-1">
              {idsSelecionados.length}
            </span>
            <span className="fw-medium small">
              {idsSelecionados.length === 1
                ? "produto selecionado"
                : "produtos selecionados"}
            </span>
          </div>

          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="btn btn-sm btn-outline-light"
              onClick={() => setIdsSelecionados([])}
            >
              Cancelar seleção
            </button>
            <button
              type="button"
              className="btn btn-sm btn-primary fw-semibold d-inline-flex align-items-center gap-1 shadow-sm"
              onClick={() => setModalLoteAberto(true)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>Trocar Produto Base</span>
            </button>
          </div>
        </div>
      )}

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

      <TrocarProdutoBaseModal
        aberto={modalLoteAberto}
        produtosSelecionados={produtosExibicao.filter((p) =>
          p.id ? idsSelecionados.includes(p.id) : false
        )}
        produtosGenericos={produtosGenericos}
        carregando={salvandoLote}
        onConfirmar={handleConfirmarTrocaBaseLote}
        onFechar={() => setModalLoteAberto(false)}
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
        idsSelecionados={idsSelecionados}
        onToggleSelecionar={handleToggleSelecionar}
        onSelecionarTodos={handleSelecionarTodos}
        onEditar={editarProdutoDepartamento}
        onExcluir={removerProdutoDepartamento}
      />
    </div>
  );
}

export default ProdutoDepartamentoPage;
