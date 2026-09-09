import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import dashboardService from "../../services/dashboardService";
import lojaService from "../../services/lojaService";
import type {
  ComparativoConfig,
  ComparativoDuasLojasConfig,
  ComparativoMesmaLojaConfig,
  ComparativoLojaData,
} from "../../types/Comparativo";
import type { Loja } from "../../types/Loja";

import { ComparativoGraficos } from "../../components/dashboard/ComparativoGraficos";
import { TabelaComparativa } from "../../components/dashboard/TabelaComparativa";
import { ExportControls } from "../../components/dashboard/ExportControls";
import { ModalComparativo } from "../../components/common/ModalComparativo";
import type { RankingItem } from "../../types/Comparativo";
import { Container, Spinner } from "react-bootstrap";
import { formatarRange } from "../../utils/format";

type TipoGrafico = "barras" | "pizza";

function vazio(
  lojaId: number,
  lojaNome: string,
  range: { dataInicio: string; dataFim: string },
  tipo: string,
): ComparativoLojaData {
  return {
    loja_id: lojaId,
    loja_nome: lojaNome,
    tipo,
    range,
    resumo: { total_quantidade: 0, quantidade_registros: 0 },
    ranking: [],
    produtos_distintos: 0,
    loading: true,
    error: null,
  };
}

function ComparativoPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const stateConfig = (location.state as { config?: ComparativoConfig } | null)
    ?.config;

  const [dadoA, setDadoA] = useState<ComparativoLojaData | null>(null);
  const [dadoB, setDadoB] = useState<ComparativoLojaData | null>(null);
  const [tipoGrafico, setTipoGrafico] = useState<TipoGrafico>("barras");
  const [filtroProduto, setFiltroProduto] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [loading, setLoading] = useState(true);

  const [config, setConfig] = useState<ComparativoConfig | null>(null);

  useEffect(() => {
    async function loadConfig() {
      setLoading(true);
      if (stateConfig) {
        setConfig(stateConfig);
        setLoading(false);
        return;
      }

      const modo = searchParams.get("modo") as "duas_lojas" | "mesma_loja" | null;
      const tipo = searchParams.get("tipo") as "" | "QUEBRA" | "TRANSFERENCIA" | null;
      const lojaAId = searchParams.get("lojaA");
      const lojaBId = searchParams.get("lojaB");
      const lojaId = searchParams.get("loja");
      const dataInicioA = searchParams.get("dataInicioA");
      const dataFimA = searchParams.get("dataFimA");
      const dataInicioB = searchParams.get("dataInicioB");
      const dataFimB = searchParams.get("dataFimB");
      const dataInicio = searchParams.get("dataInicio");
      const dataFim = searchParams.get("dataFim");
      
      const lojasList = await lojaService.listar().catch(() => [] as Loja[]);
      const lojasAtivas = lojasList.filter((l) => l.ativo);
      setLoading(false);

      if (modo && lojaAId && lojaBId && dataInicio && dataFim) {
        const lojaA = lojasAtivas.find(l => l.id === Number(lojaAId));
        const lojaB = lojasAtivas.find(l => l.id === Number(lojaBId));
        
        if (lojaA && lojaB) {
          const cfg: ComparativoDuasLojasConfig = {
            modo: "duas_lojas",
            tipo: tipo || "",
            usarDatasIguais: true,
            lojaA: { id: lojaA.id, nome: lojaA.nome },
            lojaB: { id: lojaB.id, nome: lojaB.nome },
            rangeA: { dataInicio, dataFim },
            rangeB: { dataInicio, dataFim },
          };
          setConfig(cfg);
          return;
        }
      }

      if (modo && lojaId && dataInicioA && dataFimA && dataInicioB && dataFimB) {
        const loja = lojasAtivas.find(l => l.id === Number(lojaId));
        
        if (loja) {
          const cfg: ComparativoMesmaLojaConfig = {
            modo: "mesma_loja",
            tipo: tipo || "",
            usarDatasIguais: false,
            loja: { id: loja.id, nome: loja.nome },
            rangeA: { dataInicio: dataInicioA, dataFim: dataFimA },
            rangeB: { dataInicio: dataInicioB, dataFim: dataFimB },
          };
          setConfig(cfg);
          return;
        }
      }

      if (lojasAtivas.length > 0) {
        setModalAberto(true);
      } else {
        navigate("/dashboard", { replace: true });
      }
    }

    loadConfig();
  }, [stateConfig, searchParams, navigate]);

  function handleGerar(config: ComparativoConfig) {
    setConfig(config);
    setModalAberto(false);
    window.history.replaceState({}, "", "/comparativo");
  }

  function handleVoltar() {
    navigate("/dashboard");
  }

  useEffect(() => {
    if (!config) return;

    const currentConfig = config;

    function buildLojas(): Array<{
      id: number;
      nome: string;
      range: { dataInicio: string; dataFim: string };
    }> {
      if (currentConfig.modo === "duas_lojas") {
        const c = currentConfig as ComparativoDuasLojasConfig;
        return [
          { id: c.lojaA.id, nome: c.lojaA.nome, range: c.rangeA },
          { id: c.lojaB.id, nome: c.lojaB.nome, range: c.rangeB },
        ];
      } else {
        const c = currentConfig as ComparativoMesmaLojaConfig;
        return [
          { id: c.loja.id, nome: c.loja.nome, range: c.rangeA },
          { id: c.loja.id, nome: c.loja.nome, range: c.rangeB },
        ];
      }
    }

    const lojas = buildLojas();
    const [a, b] = lojas;

    setDadoA(vazio(a.id, a.nome, a.range, currentConfig.tipo));
    setDadoB(vazio(b.id, b.nome, b.range, currentConfig.tipo));

    async function buscar(
      loja: {
        id: number;
        nome: string;
        range: { dataInicio: string; dataFim: string };
      },
      setter: (d: ComparativoLojaData) => void,
      cfg: ComparativoConfig,
    ) {
      try {
        const res = await dashboardService.buscarLancamentos({
          data_inicio: loja.range.dataInicio || undefined,
          data_fim: loja.range.dataFim || undefined,
          tipo: cfg.tipo || undefined,
          loja_ids: String(loja.id),
        });
        const ranking = res.ranking ?? [];
        const produtosDistintos = new Set(
          ranking.map((i) => i.produto_generico_id || i.produto_id),
        ).size;
        setter({
          loja_id: loja.id,
          loja_nome: loja.nome,
          tipo: cfg.tipo,
          range: loja.range,
          resumo: {
            total_quantidade: Number(res.resumo.total_quantidade) || 0,
            quantidade_registros: res.resumo.quantidade_registros || 0,
          },
          ranking,
          produtos_distintos: produtosDistintos,
          loading: false,
          error: null,
        });
      } catch (e) {
        setter({
          ...vazio(loja.id, loja.nome, loja.range, cfg.tipo),
          loading: false,
          error: e instanceof Error ? e.message : "Erro ao carregar",
        });
      }
    }

    Promise.all([
      buscar(a, setDadoA, currentConfig),
      buscar(b, setDadoB, currentConfig),
    ]);
  }, [config]);

  const rankingA = useMemo<RankingItem[]>(() => {
    if (!dadoA) return [];
    const termo = filtroProduto.toLowerCase().trim();
    return termo
      ? dadoA.ranking.filter((i) => i.produto.toLowerCase().includes(termo))
      : dadoA.ranking;
  }, [dadoA, filtroProduto]);

  const rankingB = useMemo<RankingItem[]>(() => {
    if (!dadoB) return [];
    const termo = filtroProduto.toLowerCase().trim();
    return termo
      ? dadoB.ranking.filter((i) => i.produto.toLowerCase().includes(termo))
      : dadoB.ranking;
  }, [dadoB, filtroProduto]);

  const variacao = useMemo(() => {
    if (!config || config.modo !== "mesma_loja" || !dadoA || !dadoB)
      return null;

    if (dadoA.resumo.total_quantidade === 0) {
      return {
        total: dadoB.resumo.total_quantidade > 0 ? 100 : 0,
        registros: dadoA.resumo.quantidade_registros,
        novos: 0,
        perdeu: 0,
      };
    }
    const deltaTotal =
      ((dadoB.resumo.total_quantidade - dadoA.resumo.total_quantidade) /
        dadoA.resumo.total_quantidade) *
      100;
    const idsA = new Set(
      dadoA.ranking.map((i) => i.produto_generico_id || i.produto_id),
    );
    const idsB = new Set(
      dadoB.ranking.map((i) => i.produto_generico_id || i.produto_id),
    );
    let novos = 0;
    let perdeu = 0;
    idsB.forEach((id) => {
      if (!idsA.has(id)) novos++;
    });
    idsA.forEach((id) => {
      if (!idsB.has(id)) perdeu++;
    });
    return {
      total: deltaTotal,
      registros: dadoA.resumo.quantidade_registros,
      novos,
      perdeu,
    };
  }, [config, dadoA, dadoB]);

  if (!config) {
    if (loading) {
      return (
        <Container className="py-4">
          <div className="d-flex align-items-center justify-content-center py-5">
            <div className="text-center">
              <Spinner animation="border" role="status" className="me-2">
                <span className="visually-hidden">Carregando...</span>
              </Spinner>
              <span>Carregando configuração...</span>
            </div>
          </div>
        </Container>
      );
    }
    return null;
  }

  let labelA: string;
  let labelB: string;
  let titulo: string;
  let rangeA: { dataInicio: string; dataFim: string };
  let rangeB: { dataInicio: string; dataFim: string };
  let filename: string;

  if (config.modo === "mesma_loja") {
    const c = config as ComparativoMesmaLojaConfig;
    labelA = "Periodo A";
    labelB = "Periodo B";
    titulo = `Evolucao: ${c.loja.nome}`;
    rangeA = c.rangeA;
    rangeB = c.rangeB;
    filename = `comparativo-${c.loja.nome.toLowerCase().replace(/\s+/g, "-")}-evolucao`;
  } else {
    const c = config as ComparativoDuasLojasConfig;
    labelA = c.lojaA.nome;
    labelB = c.lojaB.nome;
    titulo = `${c.lojaA.nome} vs ${c.lojaB.nome}`;
    rangeA = c.rangeA;
    rangeB = c.rangeB;
    filename = `comparativo-${c.lojaA.nome.toLowerCase().replace(/\s+/g, "-")}-vs-${c.lojaB.nome.toLowerCase().replace(/\s+/g, "-")}`;
  }

  return (
    <>
      <Container className="py-4" id="comparativo-area">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-stretch align-items-md-center mb-4 gap-2">
        <div>
          <button
            type="button"
            className="btn btn-sm btn-link text-decoration-none mb-1 ps-0"
            onClick={handleVoltar}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              fill="currentColor"
              viewBox="0 0 16 16"
              className="me-1"
            >
              <path
                fillRule="evenodd"
                d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"
              />
            </svg>
            Voltar ao Dashboard
          </button>
          <h1 className="h3 mb-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              fill="currentColor"
              viewBox="0 0 16 16"
              className="me-2 align-baseline"
            >
              <path d="M0 0h1v15h15v1H0V0Zm14.817 3.113a.5.5 0 0 1 .07.704l-4.5 5.5a.5.5 0 0 1-.74.037L7.06 6.767l-3.656 5.027a.5.5 0 0 1-.808-.588l4-5.5a.5.5 0 0 1 .758-.06l2.609 2.61 4.15-5.073a.5.5 0 0 1 .704-.07Z" />
            </svg>
            {titulo}
          </h1>
          <p className="text-body-secondary small mb-0 mt-1">
            {config.tipo === "QUEBRA"
              ? "Quebra"
              : config.tipo === "TRANSFERENCIA"
                ? "Transferencia"
                : "Todos os tipos"}
            {config.modo === "mesma_loja" ? " - Analise de evolucao" : ""}
          </p>
        </div>
        <ExportControls targetId="comparativo-conteudo" filename={filename} />
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-12 col-md-6">
              <label className="form-label small fw-semibold text-body-secondary mb-1">
                Filtrar por produto
              </label>
              <input
                type="search"
                className="form-control form-control-sm"
                placeholder="Digite o nome do produto..."
                value={filtroProduto}
                onChange={(e) => setFiltroProduto(e.target.value)}
              />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label small fw-semibold text-body-secondary mb-1">
                Tipo de Grafico
              </label>
              <div className="btn-group btn-group-sm w-100" role="group">
                <button
                  type="button"
                  className={`btn ${tipoGrafico === "barras" ? "btn-primary" : "btn-outline-primary"}`}
                  onClick={() => setTipoGrafico("barras")}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                    className="me-1"
                  >
                    <path d="M4 11H2v3h2v-3zm5-4H7v7h2V7zm5-5h-2v12h2V2zm-2-1a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1h-2zM6 7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7zm-5 4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1v-3z" />
                  </svg>
                  Barras
                </button>
                <button
                  type="button"
                  className={`btn ${tipoGrafico === "pizza" ? "btn-primary" : "btn-outline-primary"}`}
                  onClick={() => setTipoGrafico("pizza")}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                    className="me-1"
                  >
                    <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z" />
                  </svg>
                  Pizza
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="comparativo-conteudo">
        {config.modo === "mesma_loja" &&
          variacao &&
          !dadoA?.loading &&
          !dadoB?.loading && (
            <div className="row g-3 mb-4">
              <div className="col-12 col-md-4">
                <div
                  className={`p-3 rounded border text-center ${variacao.total >= 0 ? "bg-success bg-opacity-10 border-success border-opacity-25" : "bg-danger bg-opacity-10 border-danger border-opacity-25"}`}
                >
                  <div
                    className={`small fw-semibold ${variacao.total >= 0 ? "text-success" : "text-danger"}`}
                  >
                    Variacao Total
                  </div>
                  <div className="h3 mb-0 fw-bold">
                    {variacao.total > 0 ? "+" : variacao.total < 0 ? "" : "="}{" "}
                    {Math.abs(variacao.total).toFixed(1)}%
                  </div>
                  <div className="text-muted small">
                    {dadoA?.resumo.total_quantidade.toLocaleString("pt-BR")}{" "}
                    {"\u2192"}{" "}
                    {dadoB?.resumo.total_quantidade.toLocaleString("pt-BR")}
                  </div>
                </div>
              </div>
              <div className="col-12 col-md-4">
                <div className="p-3 bg-info bg-opacity-10 border border-info border-opacity-25 rounded text-center">
                  <div className="text-info small fw-semibold">
                    Novos produtos
                  </div>
                  <div className="h3 mb-0 fw-bold text-info">
                    +{variacao.novos}
                  </div>
                  <div className="text-muted small">
                    apareceram no Periodo B
                  </div>
                </div>
              </div>
              <div className="col-12 col-md-4">
                <div className="p-3 bg-warning bg-opacity-10 border border-warning border-opacity-25 rounded text-center">
                  <div className="text-warning small fw-semibold">
                    Produtos que sumiram
                  </div>
                  <div className="h3 mb-0 fw-bold text-warning">
                    -{variacao.perdeu}
                  </div>
                  <div className="text-muted small">ausentes no Periodo B</div>
                </div>
              </div>
            </div>
          )}

        <div className="row g-4 mb-4">
          <div className="col-12 col-lg-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header bg-primary bg-opacity-10 border-bottom">
                <h5 className="mb-0 d-flex align-items-center">
                  <span className="badge text-bg-primary me-2">A</span>
                  {labelA}
                </h5>
                <div className="small text-body-secondary mt-1">
                  {formatarRange(rangeA)}
                </div>
              </div>
              <div className="card-body">
                {dadoA?.loading ? (
                  <div className="d-flex align-items-center justify-content-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Carregando</span>
                    </div>
                  </div>
                ) : dadoA?.error ? (
                  <div className="alert alert-danger small mb-0">
                    {dadoA.error}
                  </div>
                ) : (
                  <>
                    <ComparativoGraficos
                      tipo={tipoGrafico}
                      ranking={rankingA}
                      label={labelA}
                      cor="rgba(13, 110, 253, 0.7)"
                    />
                    <div className="row g-2 mt-3">
                      <div className="col-4">
                        <div className="text-center p-2 bg-light rounded">
                          <div className="text-body-secondary small">Total</div>
                          <div className="fw-bold">
                            {dadoA?.resumo.total_quantidade.toLocaleString(
                              "pt-BR",
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="text-center p-2 bg-light rounded">
                          <div className="text-body-secondary small">
                            Registros
                          </div>
                          <div className="fw-bold">
                            {dadoA?.resumo.quantidade_registros.toLocaleString(
                              "pt-BR",
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="text-center p-2 bg-light rounded">
                          <div className="text-body-secondary small">
                            Produtos
                          </div>
                          <div className="fw-bold">
                            {dadoA?.produtos_distintos.toLocaleString("pt-BR")}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header bg-success bg-opacity-10 border-bottom">
                <h5 className="mb-0 d-flex align-items-center">
                  <span className="badge text-bg-success me-2">B</span>
                  {labelB}
                </h5>
                <div className="small text-body-secondary mt-1">
                  {formatarRange(rangeB)}
                </div>
              </div>
              <div className="card-body">
                {dadoB?.loading ? (
                  <div className="d-flex align-items-center justify-content-center py-5">
                    <div className="spinner-border text-success" role="status">
                      <span className="visually-hidden">Carregando</span>
                    </div>
                  </div>
                ) : dadoB?.error ? (
                  <div className="alert alert-danger small mb-0">
                    {dadoB.error}
                  </div>
                ) : (
                  <>
                    <ComparativoGraficos
                      tipo={tipoGrafico}
                      ranking={rankingB}
                      label={labelB}
                      cor="rgba(25, 135, 84, 0.7)"
                    />
                    <div className="row g-2 mt-3">
                      <div className="col-4">
                        <div className="text-center p-2 bg-light rounded">
                          <div className="text-body-secondary small">Total</div>
                          <div className="fw-bold">
                            {dadoB?.resumo.total_quantidade.toLocaleString(
                              "pt-BR",
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="text-center p-2 bg-light rounded">
                          <div className="text-body-secondary small">
                            Registros
                          </div>
                          <div className="fw-bold">
                            {dadoB?.resumo.quantidade_registros.toLocaleString(
                              "pt-BR",
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="text-center p-2 bg-light rounded">
                          <div className="text-body-secondary small">
                            Produtos
                          </div>
                          <div className="fw-bold">
                            {dadoB?.produtos_distintos.toLocaleString("pt-BR")}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {dadoA && dadoB && !dadoA.loading && !dadoB.loading && (
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <TabelaComparativa
                rankingA={rankingA}
                rankingB={rankingB}
                labelA={`${labelA} (qtd)`}
                labelB={`${labelB} (qtd)`}
              />
            </div>
          </div>
        )}
      </div>
    </Container>
    <ModalComparativo
      show={modalAberto}
      onHide={() => {
        setModalAberto(false);
        if (!config) navigate("/dashboard");
      }}
      onGerar={handleGerar}
    />
    </>
  );
}

export default ComparativoPage;
