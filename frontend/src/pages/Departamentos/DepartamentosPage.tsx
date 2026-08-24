import { useEffect, useState } from "react";
import departamentoService from "../../services/departamentoService";
import type { Departamento } from "../../types/Departamento";
import TabelaDepartamentos from "../../components/departamento/TabelaDepartamentos";
import DepartamentoModal from "../../components/departamento/DepartamentoModal";

function DepartamentosPage() {
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [loading, setLoading] = useState(true);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [departamentoSelecionado, setDepartamentoSelecionado] =
    useState<Departamento>();

  const [pesquisa, setPesquisa] = useState("");

  async function carregarDepartamentos() {
    try {
      setLoading(true);

      const lista = await departamentoService.buscarTodos();
      console.log(lista);
      setDepartamentos(lista);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarDepartamentos();
  }, []);

  async function criarDepartamento(departamento: Departamento) {
    try {
      await departamentoService.criar(departamento);

      await carregarDepartamentos();

      setMostrarModal(false);
    } catch (error) {
      console.error(error);
    }
  }

  async function atualizarDepartamento(departamento: Departamento) {
    try {
      await departamentoService.atualizar(departamento);

      await carregarDepartamentos();

      setMostrarModal(false);
    } catch (error) {
      console.error(error);
    }
  }

  async function excluirDepartamento(id: number) {
    const confirmar = window.confirm(
      "Deseja realmente excluir este departamento?",
    );

    if (!confirmar) return;

    try {
      await departamentoService.excluir(id);
      await carregarDepartamentos();
    } catch (error) {
      console.error(error);
    }
  }

  function abrirNovoDepartamento() {
    setDepartamentoSelecionado(undefined);
    setMostrarModal(true);
  }

  function editarDepartamento(departamento: Departamento) {
    setDepartamentoSelecionado(departamento);
    setMostrarModal(true);
  }

  const departamentosFiltrados = departamentos.filter((departamento) => {
    const termo = pesquisa.trim().toLocaleLowerCase();

    if (!termo) {
      return true;
    }

    return (
      departamento.nome.toLocaleLowerCase().includes(termo) ||
      String(departamento.id).includes(termo)
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
          <h1 className="h2 mb-1">Departamentos</h1>
          <p className="text-body-secondary mb-0">
            Organize os setores da operação.
          </p>
        </div>

        <button className="btn btn-primary" onClick={abrirNovoDepartamento}>
          Novo Departamento
        </button>
      </div>

      <DepartamentoModal
        aberto={mostrarModal}
        departamento={departamentoSelecionado}
        onFechar={() => {
          setMostrarModal(false);
          setDepartamentoSelecionado(undefined);
        }}
        onSalvar={
          departamentoSelecionado ? atualizarDepartamento : criarDepartamento
        }
      />
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <label
            className="form-label fw-semibold"
            htmlFor="pesquisa-departamento"
          >
            Pesquisar departamento
          </label>
          <input
            id="pesquisa-departamento"
            className="form-control"
            placeholder="Digite ID ou nome..."
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
          />
        </div>
      </div>
      <TabelaDepartamentos
        departamentos={departamentosFiltrados}
        onEditar={editarDepartamento}
        onExcluir={excluirDepartamento}
      />
    </div>
  );
}
export default DepartamentosPage;
