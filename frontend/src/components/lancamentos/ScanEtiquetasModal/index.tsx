import { useState } from "react";
import type { ScanEtiquetasResponse } from "../../../types/ScanEtiquetas";
import type { ProdutoMercearia } from "../../../types/ProdutoMercearia";
import type { ProdutoDepartamento } from "../../../types/ProdutoDepartamento";

interface ScanEtiquetasModalProps {
  resultado: ScanEtiquetasResponse;
  produtosDepartamento: ProdutoDepartamento[];
  departamentoId: number;
  onAdicionarItens: (
    itensParaAdicionar: Array<{
      produtoMercearia: ProdutoMercearia;
      produtoDepartamento?: ProdutoDepartamento;
      quantidade: number;
    }>
  ) => void;
  onFechar: () => void;
}

interface ItemState {
  selecionado: boolean;
  quantidade: number;
  produtoMercearia: ProdutoMercearia | null;
  produtoDepartamentoId: number;
}

export function ScanEtiquetasModal({
  resultado,
  produtosDepartamento,
  departamentoId,
  onAdicionarItens,
  onFechar,
}: ScanEtiquetasModalProps) {
  // Inicializa o estado para cada item detectado
  const [itensState, setItensState] = useState<ItemState[]>(() =>
    resultado.itens.map((item) => {
      const pm = item.produto_mercearia || (item.sugestoes && item.sugestoes.length > 0 ? item.sugestoes[0].produto : null);
      const pd = item.produto_departamento_sugerido || null;
      return {
        selecionado: item.status === "IDENTIFICADO",
        quantidade: 1,
        produtoMercearia: pm,
        produtoDepartamentoId: (pd && pd.id) ? pd.id : 0,
      };
    })
  );

  const toggleSelecionado = (idx: number) => {
    setItensState((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, selecionado: !item.selecionado } : item))
    );
  };

  const setQuantidade = (idx: number, qtd: number) => {
    setItensState((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, quantidade: Math.max(1, qtd) } : item))
    );
  };

  const selecionarSugestao = (idx: number, pm: ProdutoMercearia) => {
    // Ao escolher uma sugestão de mercearia, tenta encontrar o produto departamento correspondente
    const pdMatch = produtosDepartamento.find(
      (pd) =>
        pd.produto_generico_id === pm.produto_generico_id &&
        (departamentoId <= 0 || pd.departamento_id === departamentoId)
    );

    setItensState((prev) =>
      prev.map((item, i) =>
        i === idx
          ? {
              ...item,
              produtoMercearia: pm,
              produtoDepartamentoId: (pdMatch && pdMatch.id) ? pdMatch.id : 0,
              selecionado: true,
            }
          : item
      )
    );
  };

  const setProdutoDepartamento = (idx: number, pdId: number) => {
    setItensState((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, produtoDepartamentoId: pdId } : item))
    );
  };

  const handleConfirmar = () => {
    const itensValidos: Array<{
      produtoMercearia: ProdutoMercearia;
      produtoDepartamento?: ProdutoDepartamento;
      quantidade: number;
    }> = [];

    itensState.forEach((state) => {
      if (state.selecionado && state.produtoMercearia) {
        const pd = produtosDepartamento.find((p) => p.id === state.produtoDepartamentoId);
        itensValidos.push({
          produtoMercearia: state.produtoMercearia,
          produtoDepartamento: pd,
          quantidade: state.quantidade,
        });
      }
    });

    onAdicionarItens(itensValidos);
    onFechar();
  };

  const totalSelecionados = itensState.filter((it) => it.selecionado && it.produtoMercearia).length;

  return (
    <div
      className="modal d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.55)", zIndex: 1060 }}
      tabIndex={-1}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content shadow-lg border-0 rounded-3">
          <div className="modal-header border-bottom px-4 py-3 bg-light">
            <div>
              <h5 className="modal-title fw-bold text-dark d-flex align-items-center gap-2">
                <span>Leitura de Etiquetas</span>
                <span className="badge bg-primary rounded-pill small">
                  {resultado.total_identificados} de {resultado.total_detectados} identificados
                </span>
              </h5>
              <p className="text-muted small mb-0">
                Revise os produtos identificados e confirme a adição à transferência.
              </p>
            </div>
            <button type="button" className="btn-close" onClick={onFechar}></button>
          </div>

          <div className="modal-body p-4">
            {resultado.itens.length === 0 ? (
              <div className="alert alert-warning text-center mb-0">
                Nenhuma etiqueta pôde ser lida nesta foto. Tente uma foto com iluminação mais clara.
              </div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {resultado.itens.map((itemOriginal, idx) => {
                  const state = itensState[idx];
                  const pm = state.produtoMercearia;

                  return (
                    <div
                      key={idx}
                      className={`border rounded-3 p-3 transition-all ${
                        state.selecionado
                          ? "border-primary bg-primary-subtle bg-opacity-10"
                          : "border-secondary-subtle bg-white"
                      }`}
                    >
                      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-2">
                        <div className="d-flex align-items-center gap-2">
                          <input
                            type="checkbox"
                            className="form-check-input mt-0"
                            checked={state.selecionado}
                            disabled={!pm}
                            onChange={() => toggleSelecionado(idx)}
                            id={`chk-scan-${idx}`}
                          />
                          <label
                            htmlFor={`chk-scan-${idx}`}
                            className="form-check-label fw-bold text-dark mb-0 cursor-pointer"
                          >
                            Etiqueta #{idx + 1}: <code className="text-secondary">{itemOriginal.codigo_lido || "Sem código claro"}</code>
                          </label>
                        </div>

                        <div>
                          {itemOriginal.status === "IDENTIFICADO" && (
                            <span className="badge bg-success-subtle text-success border border-success-subtle">
                              100% Identificado
                            </span>
                          )}
                          {itemOriginal.status === "SUGESTAO" && (
                            <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle">
                              Sugestão por Confusão Visual
                            </span>
                          )}
                          {itemOriginal.status === "NAO_ENCONTRADO" && (
                            <span className="badge bg-danger-subtle text-danger border border-danger-subtle">
                              Não cadastrado nesta loja
                            </span>
                          )}
                        </div>
                      </div>

                      {pm ? (
                        <div className="row g-2 align-items-center mt-1">
                          <div className="col-12 col-md-5">
                            <div className="small fw-semibold text-dark">{pm.descricao}</div>
                            <div className="small text-muted">
                              SKU: {pm.sku} · Emb: {pm.quantidade_embalagem} {pm.unidade_medida}
                            </div>
                          </div>

                          <div className="col-12 col-md-4">
                            <label className="form-label small text-muted mb-1">
                              Destino (Departamento)
                            </label>
                            <select
                              className="form-select form-select-sm"
                              value={state.produtoDepartamentoId}
                              onChange={(e) => setProdutoDepartamento(idx, Number(e.target.value))}
                            >
                              <option value={0}>Selecione produto destino...</option>
                              {produtosDepartamento
                                .filter(
                                  (pd) =>
                                    pd.produto_generico_id === pm.produto_generico_id &&
                                    (departamentoId <= 0 || pd.departamento_id === departamentoId)
                                )
                                .map((pd) => (
                                  <option key={pd.id} value={pd.id}>
                                    {pd.nome} ({pd.codigo})
                                  </option>
                                ))}
                            </select>
                          </div>

                          <div className="col-12 col-md-3">
                            <label className="form-label small text-muted mb-1">Qtd. pacotes</label>
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              min={1}
                              value={state.quantidade}
                              onChange={(e) => setQuantidade(idx, Number(e.target.value))}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="mt-2">
                          <p className="small text-muted mb-1">
                            Código lido: <strong>{itemOriginal.codigo_lido}</strong>. Não foi encontrado produto com este código na loja atual.
                          </p>
                        </div>
                      )}

                      {/* Lista de alternativas se houver sugestões */}
                      {itemOriginal.sugestoes && itemOriginal.sugestoes.length > 1 && (
                        <div className="mt-2 pt-2 border-top">
                          <div className="small text-muted mb-1">Outras opções parecidas:</div>
                          <div className="d-flex flex-wrap gap-1">
                            {itemOriginal.sugestoes.map((sug, sIdx) => (
                              <button
                                key={sIdx}
                                type="button"
                                className={`btn btn-sm ${
                                  pm?.id === sug.produto.id ? "btn-primary" : "btn-outline-secondary"
                                } py-0 px-2`}
                                style={{ fontSize: "0.75rem" }}
                                onClick={() => selecionarSugestao(idx, sug.produto)}
                              >
                                {sug.produto.descricao} ({sug.produto.sku})
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="modal-footer border-top px-4 py-3 bg-light d-flex justify-content-between">
            <button type="button" className="btn btn-outline-secondary" onClick={onFechar}>
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-primary fw-semibold"
              onClick={handleConfirmar}
              disabled={totalSelecionados === 0}
            >
              Adicionar {totalSelecionados} {totalSelecionados === 1 ? "item" : "itens"} à Transferência
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default ScanEtiquetasModal;
