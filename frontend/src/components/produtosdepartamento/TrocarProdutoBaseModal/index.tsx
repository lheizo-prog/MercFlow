import { useState } from "react";
import type { ProdutoDepartamento } from "../../../types/ProdutoDepartamento";
import type { ProdutoGenerico } from "../../../types/ProdutoGenerico";
import { normalizarTexto } from "../../../utils/format";

interface TrocarProdutoBaseModalProps {
  aberto: boolean;
  produtosSelecionados: ProdutoDepartamento[];
  produtosGenericos: ProdutoGenerico[];
  carregando?: boolean;
  onConfirmar: (novoProdutoGenericoId: number) => Promise<void>;
  onFechar: () => void;
}

export function TrocarProdutoBaseModal({
  aberto,
  produtosSelecionados,
  produtosGenericos,
  carregando = false,
  onConfirmar,
  onFechar,
}: TrocarProdutoBaseModalProps) {
  const [novoProdutoId, setNovoProdutoId] = useState<number>(0);
  const [filtroBase, setFiltroBase] = useState("");

  if (!aberto) return null;

  const produtosGenericosFiltrados = produtosGenericos.filter((pg) =>
    normalizarTexto(pg.nome).includes(normalizarTexto(filtroBase))
  );

  const produtoBaseEscolhido = produtosGenericos.find((p) => p.id === novoProdutoId);

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (novoProdutoId <= 0) return;
    await onConfirmar(novoProdutoId);
  };

  return (
    <div
      className="modal d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.55)", zIndex: 1060 }}
      tabIndex={-1}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content shadow-lg border-0 rounded-3">
          <div className="modal-header border-bottom px-4 py-3 bg-light">
            <div>
              <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                <span>Trocar Produto Base em Lote</span>
                <span className="badge bg-primary rounded-pill small">
                  {produtosSelecionados.length} {produtosSelecionados.length === 1 ? "selecionado" : "selecionados"}
                </span>
              </h5>
              <p className="text-muted small mb-0">
                Selecione o novo Produto Base que será associado aos produtos de departamento abaixo.
              </p>
            </div>
            <button
              type="button"
              className="btn-close"
              disabled={carregando}
              onClick={onFechar}
            ></button>
          </div>

          <form onSubmit={handleSalvar}>
            <div className="modal-body p-4">
              {/* Seleção do Novo Produto Base */}
              <div className="mb-4">
                <label className="form-label fw-semibold text-dark">
                  Novo Produto Base <span className="text-danger">*</span>
                </label>
                <div className="mb-2">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Filtrar produtos base por nome..."
                    value={filtroBase}
                    onChange={(e) => setFiltroBase(e.target.value)}
                    disabled={carregando}
                  />
                </div>
                <select
                  className="form-select"
                  value={novoProdutoId}
                  onChange={(e) => setNovoProdutoId(Number(e.target.value))}
                  required
                  disabled={carregando}
                  size={produtosGenericosFiltrados.length > 5 ? 5 : undefined}
                >
                  <option value={0} disabled>
                    Selecione o novo produto base...
                  </option>
                  {produtosGenericosFiltrados.map((pg) => (
                    <option key={pg.id} value={pg.id}>
                      {pg.nome}
                    </option>
                  ))}
                </select>
                {produtoBaseEscolhido && (
                  <div className="alert alert-info mt-2 py-2 px-3 small mb-0 border-0 d-flex align-items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>
                      Novo Produto Base selecionado: <strong>{produtoBaseEscolhido.nome}</strong> (ID: {produtoBaseEscolhido.id})
                    </span>
                  </div>
                )}
              </div>

              {/* Lista dos produtos afetados */}
              <div>
                <label className="form-label fw-semibold text-dark mb-2">
                  Produtos que receberão a alteração:
                </label>
                <div
                  className="border rounded-3 overflow-hidden bg-white"
                  style={{ maxHeight: "200px", overflowY: "auto" }}
                >
                  <ul className="list-group list-group-flush small">
                    {produtosSelecionados.map((p) => (
                      <li
                        key={p.id}
                        className="list-group-item d-flex justify-content-between align-items-center py-2 px-3"
                      >
                        <div>
                          <span className="fw-semibold text-dark">{p.nome}</span>
                          <span className="text-muted ms-2">({p.codigo})</span>
                          <div className="text-secondary" style={{ fontSize: "0.75rem" }}>
                            Departamento: {p.departamento_nome || `ID ${p.departamento_id}`}
                          </div>
                        </div>
                        <div className="text-end">
                          <span className="badge bg-light text-secondary border">
                            Base atual: {p.produto_generico_nome || `ID ${p.produto_generico_id}`}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="modal-footer border-top px-4 py-3 bg-light d-flex justify-content-between">
              <button
                type="button"
                className="btn btn-outline-secondary"
                disabled={carregando}
                onClick={onFechar}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary fw-semibold d-inline-flex align-items-center gap-2"
                disabled={novoProdutoId <= 0 || carregando}
              >
                {carregando ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                    <span>Atualizando...</span>
                  </>
                ) : (
                  <span>
                    Confirmar troca para {produtosSelecionados.length}{" "}
                    {produtosSelecionados.length === 1 ? "produto" : "produtos"}
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default TrocarProdutoBaseModal;
