import { useMemo, useState } from "react";
import { Card, Button, Form, Spinner, Alert } from "react-bootstrap";
import { useComparativo } from "../../hooks/useComparativo";
import { ComparativoGraficos } from "./GraficosComparativo";
import { TabelaComparativa } from "./TabelaComparativa";
import { ExportarComparativo } from "./ExportarComparativo";
import { formatarRange } from "../../utils/format";

type TipoGrafico = "barras" | "pizza";

interface VariacaoInfo { total: number; registros: number; novos: number; perdeu: number; }

const containerStyle: React.CSSProperties = { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1050, padding: "20px" };
const cardStyle: React.CSSProperties = { maxHeight: "90vh", overflowY: "auto", width: "100%", maxWidth: "1200px" };

export function ComparativoModal({ onClose }: { onClose: () => void }) {
  const { stage, lojas, loadingLojas, config, dadoA, dadoB, errors, modo, tipo, lojaA, lojaB, rangeA_2, rangeB_2, loja, rangeA_1, rangeB_1, submitting, setModo, setTipo, setLojaA, setLojaB, setRangeA_2, setRangeB_2, setLoja, setRangeA_1, setRangeB_1, handleSubmit, handleBackToFilters } = useComparativo();
  const [tipoGrafico, setTipoGrafico] = useState<TipoGrafico>("barras");
  const [filtroProduto, setFiltroProduto] = useState("");

  const rankingA = useMemo(() => filtroProduto.trim() ? (dadoA?.ranking.filter((i) => i.produto.toLowerCase().includes(filtroProduto.toLowerCase())) ?? []) : (dadoA?.ranking ?? []), [dadoA, filtroProduto]);
  const rankingB = useMemo(() => filtroProduto.trim() ? (dadoB?.ranking.filter((i) => i.produto.toLowerCase().includes(filtroProduto.toLowerCase())) ?? []) : (dadoB?.ranking ?? []), [dadoB, filtroProduto]);

  const variacao = useMemo<VariacaoInfo | null>(() => {
    if (!config || config.modo !== "mesma_loja" || !dadoA || !dadoB) return null;
    if (dadoA.resumo.total_quantidade === 0) return { total: dadoB.resumo.total_quantidade > 0 ? 100 : 0, registros: dadoA.resumo.quantidade_registros, novos: 0, perdeu: 0 };
    const deltaTotal = ((dadoB.resumo.total_quantidade - dadoA.resumo.total_quantidade) / dadoA.resumo.total_quantidade) * 100;
    const idsA = new Set(dadoA.ranking.map((i) => i.produto_generico_id || i.produto_id));
    const idsB = new Set(dadoB.ranking.map((i) => i.produto_generico_id || i.produto_id));
    let novos = 0, perdeu = 0;
    idsB.forEach((id) => { if (!idsA.has(id)) novos++; });
    idsA.forEach((id) => { if (!idsB.has(id)) perdeu++; });
    return { total: deltaTotal, registros: dadoA.resumo.quantidade_registros, novos, perdeu };
  }, [config, dadoA, dadoB]);

  const { labelA, labelB, titulo, rangeA, rangeB } = useMemo(() => {
    if (config?.modo === "mesma_loja") {
      return { labelA: "Periodo A", labelB: "Periodo B", titulo: "Evolução: " + config.loja.nome, rangeA: config.rangeA, rangeB: config.rangeB };
    }
    if (config?.modo === "duas_lojas") {
      return { labelA: config.lojaA.nome, labelB: config.lojaB.nome, titulo: config.lojaA.nome + " vs " + config.lojaB.nome, rangeA: config.rangeA, rangeB: config.rangeB };
    }
    return { labelA: "", labelB: "", titulo: "", rangeA: { dataInicio: "", dataFim: "" }, rangeB: { dataInicio: "", dataFim: "" } };
  }, [config]);

  const lojaPorId = (id: number) => lojas.find((l) => l.id === id);

  const renderFilters = () => (
    <Card style={cardStyle} className="fade-in">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <Card.Title className="d-flex align-items-center gap-2 mb-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
            <path d="M0 0h1v15h15v1H0V0Zm14.817 3.113a.5.5 0 0 1 .07.704l-4.5 5.5a.5.5 0 0 1-.74.037L7.06 6.767l-3.656 5.027a.5.5 0 0 1-.808-.588l4-5.5a.5.5 0 0 1 .758-.06l2.609 2.61 4.15-5.073a.5.5 0 0 1 .704-.07Z" />
          </svg>
          Configurar Comparativo
        </Card.Title>
        <Button variant="outline-secondary" size="sm" onClick={onClose}>
          Cancelar
        </Button>
      </Card.Header>

      <Card.Body>
        {loadingLojas ? (
          <div className="d-flex align-items-center justify-content-center py-5">
            <Spinner animation="border" role="status" className="me-2" />
            <span>Carregando lojas...</span>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <label className="form-label small fw-semibold text-body-secondary mb-2">Modo de Comparação</label>
              <div className="d-flex flex-column gap-2">
                <Form.Check
                  type="radio"
                  id="modo-duas-lojas"
                  label="Comparar duas lojas diferentes"
                  checked={modo === "duas_lojas"}
                  onChange={() => setModo("duas_lojas")}
                  disabled={submitting}
                />
                <Form.Check
                  type="radio"
                  id="modo-mesma-loja"
                  label="Comparar a mesma loja em períodos diferentes"
                  checked={modo === "mesma_loja"}
                  onChange={() => setModo("mesma_loja")}
                  disabled={submitting}
                />
              </div>
            </div>

            <hr />

            <div className="mb-4">
              <label className="form-label small fw-semibold text-body-secondary mb-2 d-flex align-items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="me-1">
                  <path d="M3 2v4.586l7 7L14.586 9l-7-7H3zM2 2a1 1 0 0 1 1-1h4.586a1 1 0 0 1 .707.293l7 7a1 1 0 0 1 0 1.414l-4.586 4.586a1 1 0 0 1-1.414 0l-7-7A1 1 0 0 1 2 6.586V2z" />
                </svg>
                Tipo de Lançamento
              </label>
              <select
                className="form-select"
                value={tipo}
                onChange={(e) => setTipo(e.target.value as "" | "QUEBRA" | "TRANSFERENCIA")}
                disabled={submitting}
              >
                <option value="">Todos os tipos</option>
                <option value="QUEBRA">Quebra</option>
                <option value="TRANSFERENCIA">Transferência</option>
              </select>
            </div>

            {modo === "duas_lojas" && (
              <>
                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <label className="form-label small fw-semibold text-body-secondary">Loja A</label>
                    <select
                      className={`form-select ${errors.lojaA ? "is-invalid" : ""}`}
                      value={lojaA?.id ?? ""}
                      onChange={(e) => {
                        const id = Number(e.target.value);
                        const l = lojaPorId(id);
                        setLojaA(l ? { id: l.id, nome: l.nome } : undefined);
                      }}
                      disabled={submitting}
                    >
                      <option value="">Selecione a loja</option>
                      {lojas.map((l) => (
                        <option key={l.id} value={l.id} disabled={lojaB?.id === l.id}>
                          {l.nome}{lojaB?.id === l.id ? " (já selecionada)" : ""}
                        </option>
                      ))}
                    </select>
                    {errors.lojaA && <div className="invalid-feedback">{errors.lojaA}</div>}
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-semibold text-body-secondary">Loja B</label>
                    <select
                      className={`form-select ${errors.lojaB ? "is-invalid" : ""}`}
                      value={lojaB?.id ?? ""}
                      onChange={(e) => {
                        const id = Number(e.target.value);
                        const l = lojaPorId(id);
                        setLojaB(l ? { id: l.id, nome: l.nome } : undefined);
                      }}
                      disabled={submitting}
                    >
                      <option value="">Selecione a loja</option>
                      {lojas.map((l) => (
                        <option key={l.id} value={l.id} disabled={lojaA?.id === l.id}>
                          {l.nome}{lojaA?.id === l.id ? " (já selecionada)" : ""}
                        </option>
                      ))}
                    </select>
                    {errors.lojaB && <div className="invalid-feedback">{errors.lojaB}</div>}
                  </div>
                </div>

                <div className="p-3 bg-light rounded mb-3">
                  <label className="form-label small fw-semibold text-body-secondary">Período - Loja A</label>
                  <div className="row g-3">
                    <div className="col-6">
                      <label className="form-label small text-body-secondary">Data Início</label>
                      <input
                        type="date"
                        className="form-control form-control-sm"
                        value={rangeA_2.dataInicio}
                        onChange={(e) => setRangeA_2({ ...rangeA_2, dataInicio: e.target.value })}
                        disabled={submitting}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small text-body-secondary">Data Fim</label>
                      <input
                        type="date"
                        className="form-control form-control-sm"
                        value={rangeA_2.dataFim}
                        onChange={(e) => setRangeA_2({ ...rangeA_2, dataFim: e.target.value })}
                        disabled={submitting}
                      />
                    </div>
                  </div>
                  {errors.rangeA_2 && <div className="text-danger small mt-1">{errors.rangeA_2}</div>}
                </div>
                <div className="p-3 bg-light rounded">
                  <label className="form-label small fw-semibold text-body-secondary">Período - Loja B</label>
                  <div className="row g-3">
                    <div className="col-6">
                      <label className="form-label small text-body-secondary">Data Início</label>
                      <input
                        type="date"
                        className="form-control form-control-sm"
                        value={rangeB_2.dataInicio}
                        onChange={(e) => setRangeB_2({ ...rangeB_2, dataInicio: e.target.value })}
                        disabled={submitting}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small text-body-secondary">Data Fim</label>
                      <input
                        type="date"
                        className="form-control form-control-sm"
                        value={rangeB_2.dataFim}
                        onChange={(e) => setRangeB_2({ ...rangeB_2, dataFim: e.target.value })}
                        disabled={submitting}
                      />
                    </div>
                  </div>
                  {errors.rangeB_2 && <div className="text-danger small mt-1">{errors.rangeB_2}</div>}
                </div>
              </>
            )}

            {modo === "mesma_loja" && (
              <>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-body-secondary">Loja</label>
                  <select
                    className={`form-select ${errors.loja ? "is-invalid" : ""}`}
                    value={loja?.id ?? ""}
                    onChange={(e) => {
                      const id = Number(e.target.value);
                      const l = lojaPorId(id);
                      setLoja(l ? { id: l.id, nome: l.nome } : undefined);
                    }}
                    disabled={submitting}
                  >
                    <option value="">Selecione a loja</option>
                    {lojas.map((l) => (
                      <option key={l.id} value={l.id}>{l.nome}</option>
                    ))}
                  </select>
                  {errors.loja && <div className="invalid-feedback">{errors.loja}</div>}
                  <div className="form-text small">Cada período terá seu próprio intervalo de datas</div>
                </div>

                <div className="p-3 bg-light rounded mb-3">
                  <label className="form-label small fw-semibold text-primary">Período A (mais antigo)</label>
                  <div className="row g-3">
                    <div className="col-6">
                      <label className="form-label small text-body-secondary">Data Início</label>
                      <input
                        type="date"
                        className="form-control form-control-sm"
                        value={rangeA_1.dataInicio}
                        onChange={(e) => setRangeA_1({ ...rangeA_1, dataInicio: e.target.value })}
                        disabled={submitting}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small text-body-secondary">Data Fim</label>
                      <input
                        type="date"
                        className="form-control form-control-sm"
                        value={rangeA_1.dataFim}
                        onChange={(e) => setRangeA_1({ ...rangeA_1, dataFim: e.target.value })}
                        disabled={submitting}
                      />
                    </div>
                  </div>
                  {errors.rangeA_1 && <div className="text-danger small mt-1">{errors.rangeA_1}</div>}
                </div>

                <div className="p-3 bg-light rounded">
                  <label className="form-label small fw-semibold text-success">Período B (mais recente)</label>
                  <div className="row g-3">
                    <div className="col-6">
                      <label className="form-label small text-body-secondary">Data Início</label>
                      <input
                        type="date"
                        className="form-control form-control-sm"
                        value={rangeB_1.dataInicio}
                        onChange={(e) => setRangeB_1({ ...rangeB_1, dataInicio: e.target.value })}
                        disabled={submitting}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small text-body-secondary">Data Fim</label>
                      <input
                        type="date"
                        className="form-control form-control-sm"
                        value={rangeB_1.dataFim}
                        onChange={(e) => setRangeB_1({ ...rangeB_1, dataFim: e.target.value })}
                        disabled={submitting}
                      />
                    </div>
                  </div>
                  {errors.rangeB_1 && <div className="text-danger small mt-1">{errors.rangeB_1}</div>}
                </div>
              </>
            )}
          </>
        )}
      </Card.Body>

      <Card.Footer className="text-end">
        <Button variant="outline-secondary" onClick={onClose} disabled={submitting} className="me-2">
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={submitting || loadingLojas}>
          {submitting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
              Gerando...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="me-1">
                <path d="M8 3a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.5.5H4a.5.5 0 0 1 0-1h3.5V3.5A.5.5 0 0 1 8 3z" />
                <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z" />
              </svg>
              Gerar Comparativo
            </>
          )}
        </Button>
      </Card.Footer>
    </Card>
  );

  const renderLoading = () => (
    <Card style={cardStyle} className="fade-in">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <Card.Title className="d-flex align-items-center gap-2 mb-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
            <path d="M0 0h1v15h15v1H0V0Zm14.817 3.113a.5.5 0 0 1 .07.704l-4.5 5.5a.5.5 0 0 1-.74.037L7.06 6.767l-3.656 5.027a.5.5 0 0 1-.808-.588l4-5.5a.5.5 0 0 1 .758-.06l2.609 2.61 4.15-5.073a.5.5 0 0 1 .704-.07Z" />
          </svg>
          Carregando Comparativo...
        </Card.Title>
        <Button variant="outline-secondary" size="sm" onClick={onClose}>
          Cancelar
        </Button>
      </Card.Header>
      <Card.Body className="d-flex align-items-center justify-content-center py-5">
        <div className="text-center">
          <Spinner animation="border" role="status" className="me-2" />
          <span>Buscando dados do comparativo...</span>
        </div>
      </Card.Body>
    </Card>
  );

  const renderResults = () => {
    if (!config || !dadoA || !dadoB) {
      return (
        <Card style={cardStyle} className="fade-in">
          <Card.Body>
            <Alert variant="warning">
              Nenhuma configuração válida encontrada. Por favor, tente novamente.
            </Alert>
          </Card.Body>
        </Card>
      );
    }

    const bothLoaded = !dadoA.loading && !dadoB.loading;
    const hasError = dadoA.error || dadoB.error;

    return (
      <Card style={cardStyle} className="fade-in">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path d="M0 0h1v15h15v1H0V0Zm14.817 3.113a.5.5 0 0 1 .07.704l-4.5 5.5a.5.5 0 0 1-.74.037L7.06 6.767l-3.656 5.027a.5.5 0 0 1-.808-.588l4-5.5a.5.5 0 0 1 .758-.06l2.609 2.61 4.15-5.073a.5.5 0 0 1 .704-.07Z" />
            </svg>
            <span className="fw-semibold">{titulo}</span>
          </div>
          <div className="d-flex gap-2">
            <Button variant="outline-primary" size="sm" onClick={handleBackToFilters}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16" className="me-1">
                <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z" />
              </svg>
              Alterar Filtros
            </Button>
            <Button variant="outline-secondary" size="sm" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </Card.Header>

        <Card.Body id="comparativo-modal-conteudo">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <div className="row g-3 align-items-end">
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold text-body-secondary mb-1">Filtrar por produto</label>
                  <input
                    type="search"
                    className="form-control form-control-sm"
                    placeholder="Digite o nome do produto..."
                    value={filtroProduto}
                    onChange={(e) => setFiltroProduto(e.target.value)}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold text-body-secondary mb-1">Tipo de Gráfico</label>
                  <div className="btn-group btn-group-sm w-100" role="group">
                    <button
                      type="button"
                      className={`btn ${tipoGrafico === "barras" ? "btn-primary" : "btn-outline-primary"}`}
                      onClick={() => setTipoGrafico("barras")}
                    >
                      Barras
                    </button>
                    <button
                      type="button"
                      className={`btn ${tipoGrafico === "pizza" ? "btn-primary" : "btn-outline-primary"}`}
                      onClick={() => setTipoGrafico("pizza")}
                    >
                      Pizza
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-end mb-3">
            <ExportarComparativo targetId="comparativo-modal-conteudo" filename="comparativo" />
          </div>

          {config.modo === "mesma_loja" && variacao && bothLoaded && !hasError && (
            <div className="row g-3 mb-4">
              <div className="col-12 col-md-4">
                <div className={`p-3 rounded border text-center ${variacao.total >= 0 ? "bg-success bg-opacity-10 border-success border-opacity-25" : "bg-danger bg-opacity-10 border-danger border-opacity-25"}`}>
                  <div className={`small fw-semibold ${variacao.total >= 0 ? "text-success" : "text-danger"}`}>Variação Total</div>
                  <div className="h3 mb-0 fw-bold">
                    {variacao.total > 0 ? "+" : variacao.total < 0 ? "" : "="} {Math.abs(variacao.total).toFixed(1)}%
                  </div>
                  <div className="text-muted small">
                    {dadoA?.resumo.total_quantidade.toLocaleString("pt-BR")} → {dadoB?.resumo.total_quantidade.toLocaleString("pt-BR")}
                  </div>
                </div>
              </div>
              <div className="col-12 col-md-4">
                <div className="p-3 bg-info bg-opacity-10 border border-info border-opacity-25 rounded text-center">
                  <div className="text-info small fw-semibold">Novos produtos</div>
                  <div className="h3 mb-0 fw-bold text-info">+{variacao.novos}</div>
                  <div className="text-muted small">apareceram no Período B</div>
                </div>
              </div>
              <div className="col-12 col-md-4">
                <div className="p-3 bg-warning bg-opacity-10 border border-warning border-opacity-25 rounded text-center">
                  <div className="text-warning small fw-semibold">Produtos que sumiram</div>
                  <div className="h3 mb-0 fw-bold text-warning">-{variacao.perdeu}</div>
                  <div className="text-muted small">ausentes no Período B</div>
                </div>
              </div>
            </div>
          )}

          <div className="row g-4 mb-4">
            <div className="col-12 col-lg-6">
              <Card className="border-0 shadow-sm h-100">
                <Card.Header className="bg-primary bg-opacity-10 border-bottom">
                  <h5 className="mb-0 d-flex align-items-center">
                    <span className="badge text-bg-primary me-2">A</span>
                    {labelA}
                  </h5>
                  <div className="small text-body-secondary mt-1">{formatarRange(rangeA)}</div>
                </Card.Header>
                <Card.Body>
                  {dadoA?.loading ? (
                    <div className="d-flex align-items-center justify-content-center py-5">
                      <Spinner animation="border" role="status" className="text-primary">
                        <span className="visually-hidden">Carregando</span>
                      </Spinner>
                    </div>
                  ) : dadoA?.error ? (
                    <Alert variant="danger" className="small mb-0">{dadoA.error}</Alert>
                  ) : (
                    <>
                      <ComparativoGraficos tipo={tipoGrafico} ranking={rankingA} label={labelA} cor="rgba(13, 110, 253, 0.7)" />
                      <div className="row g-2 mt-3">
                        <div className="col-4">
                          <div className="text-center p-2 bg-light rounded">
                            <div className="text-body-secondary small">Total</div>
                            <div className="fw-bold">{dadoA?.resumo.total_quantidade.toLocaleString("pt-BR")}</div>
                          </div>
                        </div>
                        <div className="col-4">
                          <div className="text-center p-2 bg-light rounded">
                            <div className="text-body-secondary small">Registros</div>
                            <div className="fw-bold">{dadoA?.resumo.quantidade_registros.toLocaleString("pt-BR")}</div>
                          </div>
                        </div>
                        <div className="col-4">
                          <div className="text-center p-2 bg-light rounded">
                            <div className="text-body-secondary small">Produtos</div>
                            <div className="fw-bold">{dadoA?.produtos_distintos.toLocaleString("pt-BR")}</div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </Card.Body>
              </Card>
            </div>

            <div className="col-12 col-lg-6">
              <Card className="border-0 shadow-sm h-100">
                <Card.Header className="bg-success bg-opacity-10 border-bottom">
                  <h5 className="mb-0 d-flex align-items-center">
                    <span className="badge text-bg-success me-2">B</span>
                    {labelB}
                  </h5>
                  <div className="small text-body-secondary mt-1">{formatarRange(rangeB)}</div>
                </Card.Header>
                <Card.Body>
                  {dadoB?.loading ? (
                    <div className="d-flex align-items-center justify-content-center py-5">
                      <Spinner animation="border" role="status" className="text-success">
                        <span className="visually-hidden">Carregando</span>
                      </Spinner>
                    </div>
                  ) : dadoB?.error ? (
                    <Alert variant="danger" className="small mb-0">{dadoB.error}</Alert>
                  ) : (
                    <>
                      <ComparativoGraficos tipo={tipoGrafico} ranking={rankingB} label={labelB} cor="rgba(25, 135, 84, 0.7)" />
                      <div className="row g-2 mt-3">
                        <div className="col-4">
                          <div className="text-center p-2 bg-light rounded">
                            <div className="text-body-secondary small">Total</div>
                            <div className="fw-bold">{dadoB?.resumo.total_quantidade.toLocaleString("pt-BR")}</div>
                          </div>
                        </div>
                        <div className="col-4">
                          <div className="text-center p-2 bg-light rounded">
                            <div className="text-body-secondary small">Registros</div>
                            <div className="fw-bold">{dadoB?.resumo.quantidade_registros.toLocaleString("pt-BR")}</div>
                          </div>
                        </div>
                        <div className="col-4">
                          <div className="text-center p-2 bg-light rounded">
                            <div className="text-body-secondary small">Produtos</div>
                            <div className="fw-bold">{dadoB?.produtos_distintos.toLocaleString("pt-BR")}</div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </Card.Body>
              </Card>
            </div>
          </div>

          {bothLoaded && !hasError && dadoA && dadoB && (
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <TabelaComparativa rankingA={rankingA} rankingB={rankingB} labelA={`${labelA} (qtd)`} labelB={`${labelB} (qtd)`} />
              </Card.Body>
            </Card>
          )}
        </Card.Body>

        <Card.Footer className="text-end">
          <Button variant="outline-primary" size="sm" onClick={handleBackToFilters} className="me-2">
            Alterar Filtros
          </Button>
          <Button variant="outline-secondary" size="sm" onClick={onClose}>
            Fechar
          </Button>
        </Card.Footer>
      </Card>
    );
  };

  return (
    <div style={containerStyle}>
      {stage === "filters" && renderFilters()}
      {stage === "loading" && renderLoading()}
      {stage === "results" && renderResults()}
    </div>
  );
}