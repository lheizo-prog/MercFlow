import { useEffect, useState } from "react";

import lancamentoService from "../../services/lancamentoService";
import produtoMerceariaService from "../../services/produtoMerceariaService";
import produtoDepartamentoService from "../../services/produtoDepartamentoService";
import departamentoService from "../../services/departamentoService";

import type { LancamentoPayload } from "../../types/Lancamento";
import type { ProdutoMercearia } from "../../types/ProdutoMercearia";
import type { ProdutoDepartamento } from "../../types/ProdutoDepartamento";
import type { Departamento } from "../../types/Departamento";

import LancamentoForm from "../../components/lancamentos/LancamentoForm/index";

function LancamentoPage() {
  const [produtosMercearia, setProdutosMercearia] = useState<
    ProdutoMercearia[]
  >([]);

  const [produtosDepartamento, setProdutosDepartamento] = useState<
    ProdutoDepartamento[]
  >([]);

  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);

  const [loading, setLoading] = useState(true);

  async function carregarProdutosMercearia() {
    try {
      const lista = await produtoMerceariaService.buscarTodos();

      setProdutosMercearia(lista);
    } catch (error) {
      console.error(error);
    }
  }

  async function carregarProdutosDepartamento() {
    try {
      const lista = await produtoDepartamentoService.buscarTodos();

      setProdutosDepartamento(lista);
    } catch (error) {
      console.error(error);
    }
  }

  async function carregarDepartamentos() {
    try {
      const lista = await departamentoService.buscarTodos();
      const listaSemDuplicatas = lista.filter(
        (departamento, index, departamentos) =>
          departamentos.findIndex(
            (item) =>
              item.nome.trim().toLowerCase() ===
              departamento.nome.trim().toLowerCase(),
          ) === index,
      );
      const mercearia = listaSemDuplicatas.find(
        (departamento) =>
          departamento.nome.trim().toLowerCase() === "mercearia",
      );

      if (mercearia) {
        setDepartamentos(listaSemDuplicatas);
        return;
      }

      const departamentoMercearia = await departamentoService.criar({
        nome: "Mercearia",
      });

      setDepartamentos([...listaSemDuplicatas, departamentoMercearia]);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    async function carregarDados() {
      try {
        setLoading(true);

        await Promise.all([
          carregarProdutosMercearia(),
          carregarProdutosDepartamento(),
          carregarDepartamentos(),
        ]);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, []);

  async function criarLancamento(lancamento: LancamentoPayload): Promise<void> {
    try {
      await lancamentoService.criar(lancamento);

      console.log("Lançamento criado com sucesso");
    } catch (error) {
      console.error("Erro ao criar lançamento:", error);
      throw error;
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Carregando</span>
        </div>
      </div>
    );
  }
  return (
    <div className="container-fluid px-0">
      <div className="border-bottom pb-3 mb-4">
        <p className="text-uppercase text-success fw-semibold small mb-1">
          Operação de estoque
        </p>
        <h1 className="h2 mb-1">Novo lançamento</h1>
        <p className="text-body-secondary mb-0">
          Registre transferências e quebras com rastreabilidade.
        </p>
      </div>

      <LancamentoForm
        departamentos={departamentos}
        produtosMercearia={produtosMercearia}
        produtosDepartamento={produtosDepartamento}
        onSalvar={criarLancamento}
      />
    </div>
  );
}

export default LancamentoPage;
