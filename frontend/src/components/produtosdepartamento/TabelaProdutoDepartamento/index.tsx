import { useMemo } from "react";
import type { ProdutoDepartamento } from "../../../types/ProdutoDepartamento";

interface TabelaProdutosDepartamentoProps {
  produtos: ProdutoDepartamento[];
  idsSelecionados: number[];
  onToggleSelecionar: (id: number) => void;
  onSelecionarTodos: () => void;
  onEditar: (produto: ProdutoDepartamento) => void;
  onExcluir: (id: number) => void;
}

function TabelaProdutosDepartamento({
  produtos,
  idsSelecionados,
  onToggleSelecionar,
  onSelecionarTodos,
  onEditar,
  onExcluir,
}: TabelaProdutosDepartamentoProps) {
  const produtosOrdenados = useMemo(() => [...produtos], [produtos]);

  const todosSelecionados =
    produtosOrdenados.length > 0 &&
    produtosOrdenados.every((p) => p.id && idsSelecionados.includes(p.id));

  if (produtosOrdenados.length === 0) {
    return (
      <div className="table-responsive bg-white rounded shadow-sm p-4">
        <div className="text-center text-body-secondary">
          Nenhum produto de departamento encontrado.
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Barra de Selecionar Todos */}
      <div className="d-flex align-items-center justify-content-between mb-3 px-1">
        <div className="form-check d-flex align-items-center gap-2 mb-0">
          <input
            id="chk-selecionar-todos"
            type="checkbox"
            className="form-check-input"
            checked={todosSelecionados}
            onChange={onSelecionarTodos}
            style={{ cursor: "pointer", width: "1.15rem", height: "1.15rem" }}
          />
          <label
            htmlFor="chk-selecionar-todos"
            className="form-check-label fw-semibold text-secondary small user-select-none"
            style={{ cursor: "pointer" }}
          >
            {todosSelecionados ? "Desmarcar todos" : "Selecionar todos da lista"}
          </label>
        </div>
        <span className="text-muted small">
          Total de itens: <strong>{produtosOrdenados.length}</strong>
        </span>
      </div>

      <div className="row g-3">
        {produtosOrdenados.map((produto) => {
          const selecionado = produto.id ? idsSelecionados.includes(produto.id) : false;

          return (
            <div key={produto.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
              <div
                className={`card border shadow-sm h-100 transition-all ${
                  selecionado ? "border-primary bg-primary bg-opacity-10 shadow" : "border-0"
                }`}
                style={{
                  transition: "all 0.2s ease",
                  borderColor: selecionado ? "#2563eb" : undefined,
                }}
              >
                <div className="card-body d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div className="form-check mb-0">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id={`chk-prod-${produto.id}`}
                        checked={selecionado}
                        onChange={() => produto.id && onToggleSelecionar(produto.id)}
                        style={{ cursor: "pointer" }}
                      />
                    </div>
                    <span className="badge bg-light text-secondary border small">
                      ID: {produto.id}
                    </span>
                  </div>

                  <h5 className="card-title mb-1 text-dark fw-bold" style={{ fontSize: "1.05rem" }}>
                    {produto.nome}
                  </h5>

                  <p className="card-text small mb-1">
                    <span className="text-secondary">Base:</span>{" "}
                    <strong>{produto.produto_generico_nome}</strong>
                  </p>
                  <p className="card-text small mb-1">
                    <span className="text-secondary">Departamento:</span>{" "}
                    <span className="badge bg-secondary bg-opacity-10 text-secondary border">
                      {produto.departamento_nome}
                    </span>
                  </p>
                  <p className="card-text small mb-1">
                    <span className="text-secondary">Código:</span> <code>{produto.codigo}</code>
                  </p>
                  <p className="card-text small mb-3 text-muted">
                    <span className="text-secondary">Unidade:</span> {produto.unidade_medida}
                  </p>

                  <div className="mt-auto">
                    <div className="d-flex gap-2">
                      <button
                        onClick={() => onEditar(produto)}
                        className="btn btn-sm btn-outline-primary flex-grow-1"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => onExcluir(produto.id!)}
                        className="btn btn-sm btn-outline-danger flex-grow-1"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TabelaProdutosDepartamento;
