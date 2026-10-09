import { useState } from "react";
import type { ScanEtiquetasResponse } from "../../../types/ScanEtiquetas";
import type { ProdutoMercearia } from "../../../types/ProdutoMercearia";
import type { ProdutoDepartamento } from "../../../types/ProdutoDepartamento";

export interface ItemQuebraScan {
  produtoMercearia?: ProdutoMercearia;
  produtoDepartamento?: ProdutoDepartamento;
  quantidade: number;
}

interface ScanEtiquetasModalProps {
  resultado: ScanEtiquetasResponse;
  isDepartamentoMercearia: boolean;
  onAdicionarItens: (itensParaAdicionar: ItemQuebraScan[]) => void;
  onFechar: () => void;
}

interface ItemState {
  selecionado: boolean;
  quantidade: number;
  produtoMercearia: ProdutoMercearia | null;
  produtoDepartamento: ProdutoDepartamento | null;
}

export function ScanEtiquetasModal({
  resultado,
  isDepartamentoMercearia,
  onAdicionarItens,
  onFechar,
}: ScanEtiquetasModalProps) {
  // Inicializa o estado para cada item detectado
  const [itensState, setItensState] = useState<ItemState[]>(() =>
    resultado.itens.map((item) => {
      const pm =
        item.produto_mercearia ||
        (item.sugestoes && item.sugestoes.length > 0
          ? item.sugestoes[0].produto
          : null);
      const pd =
        item.produto_departamento ||
        (item.sugestoes_departamento && item.sugestoes_departamento.length > 0
          ? item.sugestoes_departamento[0].produto
          : null);

      const possuiProduto = isDepartamentoMercearia ? !!pm : !!(pd || pm);

      return {
        selecionado: item.status === "IDENTIFICADO" && possuiProduto,
        quantidade: 1,
        produtoMercearia: pm,
        produtoDepartamento: pd,
      };
    })
  );

  const toggleSelecionado = (idx: number) => {
    setItensState((prev) =>
      prev.map((item, i) =>
        i === idx ? { ...item, selecionado: !item.selecionado } : item
      )
    );
  };

  const setQuantidade = (idx: number, qtd: number) => {
    setItensState((prev) =>
      prev.map((item, i) =>
        i === idx ? { ...item, quantidade: Math.max(1, qtd) } : item
      )
    );
  };

  const selecionarSugestaoMercearia = (idx: number, pm: ProdutoMercearia) => {
    setItensState((prev) =>
      prev.map((item, i) =>
        i === idx
          ? {
              ...item,
              produtoMercearia: pm,
              selecionado: true,
            }
          : item
      )
    );
  };

  const selecionarSugestaoDepartamento = (
    idx: number,
    pd: ProdutoDepartamento
  ) => {
    setItensState((prev) =>
      prev.map((item, i) =>
        i === idx
          ? {
              ...item,
              produtoDepartamento: pd,
              selecionado: true,
            }
          : item
      )
    );
  };

  const handleConfirmar = () => {
    const itensValidos: ItemQuebraScan[] = [];

    itensState.forEach((state) => {
      if (state.selecionado) {
        if (isDepartamentoMercearia && state.produtoMercearia) {
          itensValidos.push({
            produtoMercearia: state.produtoMercearia,
            quantidade: state.quantidade,
          });
        } else if (!isDepartamentoMercearia) {
          if (state.produtoDepartamento) {
            itensValidos.push({
              produtoDepartamento: state.produtoDepartamento,
              quantidade: state.quantidade,
            });
          } else if (state.produtoMercearia) {
            itensValidos.push({
              produtoMercearia: state.produtoMercearia,
              quantidade: state.quantidade,
            });
          }
        }
      }
    });

    onAdicionarItens(itensValidos);
    onFechar();
  };

  const totalSelecionados = itensState.filter((it) => {
    if (!it.selecionado) return false;
    return isDepartamentoMercearia
      ? !!it.produtoMercearia
      : !!(it.produtoDepartamento || it.produtoMercearia);
  }).length;

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
                <span>Leitura de Etiquetas — Quebra</span>
                <span className="badge bg-danger rounded-pill small">
                  {resultado.total_identificados} de {resultado.total_detectados} identificados
                </span>
              </h5>
              <p className="text-muted small mb-0">
                Revise os itens avariados/quebrados identificados para adicionar à tabela de Quebra.
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
                  const pd = state.produtoDepartamento;
                  const produtoExibido = isDepartamentoMercearia ? pm : (pd || pm);

                  return (
                    <div
                      key={idx}
                      className={`border rounded-3 p-3 transition-all ${
                        state.selecionado
                          ? "border-danger bg-danger-subtle bg-opacity-10"
                          : "border-secondary-subtle bg-white"
                      }`}
                    >
                      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-2">
                        <div className="d-flex align-items-center gap-2">
                          <input
                            type="checkbox"
                            className="form-check-input mt-0"
                            checked={state.selecionado}
                            disabled={!produtoExibido}
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
                              Sugestão de Produto
                            </span>
                          )}
                          {itemOriginal.status === "NAO_ENCONTRADO" && (
                            <span className="badge bg-danger-subtle text-danger border border-danger-subtle">
                              Não cadastrado nesta loja
                            </span>
                          )}
                        </div>
                      </div>

                      {produtoExibido ? (
                        <div className="row g-2 align-items-center mt-1">
                          <div className="col-12 col-md-8">
                            <div className="small fw-semibold text-dark">
                              {"descricao" in produtoExibido
                                ? produtoExibido.descricao
                                : produtoExibido.nome}
                            </div>
                            <div className="small text-muted">
                              {"sku" in produtoExibido
                                ? `SKU: ${produtoExibido.sku} · C. Barras: ${produtoExibido.codigo_barras || "-"} · Emb: ${produtoExibido.quantidade_embalagem} ${produtoExibido.unidade_medida}`
                                : `Código: ${produtoExibido.codigo} · Un: ${produtoExibido.unidade_medida}`}
                            </div>
                          </div>

                          <div className="col-12 col-md-4">
                            <label className="form-label small text-muted mb-1">
                              Qtd. de Quebra (pacotes/unidades)
                            </label>
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
                            Código lido: <strong>{itemOriginal.codigo_lido}</strong>. Não foi encontrado produto correspondente cadastrado.
                          </p>
                        </div>
                      )}

                      {/* Sugestões de Departamento */}
                      {itemOriginal.sugestoes_departamento && itemOriginal.sugestoes_departamento.length > 0 && (
                        <div className="mt-2 pt-2 border-top">
                          <div className="small text-muted mb-1">Produtos compatíveis no departamento:</div>
                          <div className="d-flex flex-wrap gap-1">
                            {itemOriginal.sugestoes_departamento.map((sug, sIdx) => (
                              <button
                                key={sIdx}
                                type="button"
                                className={`btn btn-sm ${
                                  pd?.id === sug.produto.id ? "btn-danger" : "btn-outline-secondary"
                                } py-0 px-2`}
                                style={{ fontSize: "0.75rem" }}
                                onClick={() => selecionarSugestaoDepartamento(idx, sug.produto)}
                              >
                                {sug.produto.nome} ({sug.produto.codigo})
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Sugestões de Mercearia */}
                      {itemOriginal.sugestoes && itemOriginal.sugestoes.length > 1 && (
                        <div className="mt-2 pt-2 border-top">
                          <div className="small text-muted mb-1">Outras opções na mercearia:</div>
                          <div className="d-flex flex-wrap gap-1">
                            {itemOriginal.sugestoes.map((sug, sIdx) => (
                              <button
                                key={sIdx}
                                type="button"
                                className={`btn btn-sm ${
                                  pm?.id === sug.produto.id ? "btn-danger" : "btn-outline-secondary"
                                } py-0 px-2`}
                                style={{ fontSize: "0.75rem" }}
                                onClick={() => selecionarSugestaoMercearia(idx, sug.produto)}
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
              className="btn btn-danger fw-semibold"
              onClick={handleConfirmar}
              disabled={totalSelecionados === 0}
            >
              Adicionar {totalSelecionados} {totalSelecionados === 1 ? "item" : "itens"} à Quebra
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScanEtiquetasModal;
