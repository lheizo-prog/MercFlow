import { useEffect, useMemo, useState, type CSSProperties } from "react";

import dashboardService from "../../services/dashboardService";
import departamentoService from "../../services/departamentoService";
import produtoDepartamentoService from "../../services/produtoDepartamentoService";
import produtoGenericoService from "../../services/produtoGenericoService";
import produtoMerceariaService from "../../services/produtoMerceariaService";

import type { DashboardLancamentoResponse } from "../../types/Dashboard";
import type { Departamento } from "../../types/Departamento";
import type { ProdutoDepartamento } from "../../types/ProdutoDepartamento";
import type { ProdutoGenerico } from "../../types/ProdutoGenerico";
import type { ProdutoMercearia } from "../../types/ProdutoMercearia";

const dashboardVazio: DashboardLancamentoResponse = {
  filtros: {
    tipo: "",
    data_inicio: "",
    data_fim: "",
    departamento_id: 0,
    produto_id: 0,
    produto_generico_id: 0,
  },
  resumo: { total_quantidade: 0, quantidade_registros: 0 },
  ranking: [],
};

type RankingItem = DashboardLancamentoResponse["ranking"][number];

function formatarDataLocal(data: Date) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

function obterPeriodoInicial() {
  const fim = new Date();
  const inicio = new Date(fim);
  inicio.setMonth(inicio.getMonth() - 1);

  return {
    inicio: formatarDataLocal(inicio),
    fim: formatarDataLocal(fim),
  };
}

const periodoInicial = obterPeriodoInicial();

function GraficoRanking({
  ranking,
  visualizacao,
  animacao,
  variante,
}: {
  ranking: RankingItem[];
  visualizacao: "barras" | "pizza";
  animacao: number;
  variante: "principal" | "comparacao";
}) {
  const maiorQuantidade = Math.max(
    ...ranking.map((item) => item.quantidade),
    1,
  );
  const total = ranking.reduce((soma, item) => soma + item.quantidade, 0);
  const cores =
    variante === "comparacao"
      ? [
          "#ffc107",
          "#0dcaf0",
          "#dc3545",
          "#198754",
          "#6f42c1",
          "#fd7e14",
          "#d63384",
          "#6c757d",
        ]
      : [
          "#0d6efd",
          "#198754",
          "#fd7e14",
          "#dc3545",
          "#6f42c1",
          "#20c997",
          "#d63384",
          "#6c757d",
        ];
  const fatias = ranking.reduce<
    Array<
      RankingItem & {
        inicio: number;
        fim: number;
        percentual: number;
        cor: string;
      }
    >
  >((resultado, item, index) => {
    const inicio =
      resultado.length > 0 ? resultado[resultado.length - 1].fim : 0;
    const fim = total > 0 ? inicio + (item.quantidade / total) * 100 : 0;
    return [
      ...resultado,
      {
        ...item,
        inicio,
        fim,
        percentual: total > 0 ? (item.quantidade / total) * 100 : 0,
        cor: cores[index % cores.length],
      },
    ];
  }, []);
  const gradiente =
    fatias.length > 0
      ? `conic-gradient(${fatias.map((item) => `${item.cor} ${item.inicio}% ${item.fim}%`).join(", ")})`
      : "#e9ecef";

  if (visualizacao === "pizza") {
    return (
      <div className="dashboard-grafico d-flex flex-column gap-4 align-items-center">
        <div
          key={`pizza-${animacao}`}
          className="dashboard-pizza rounded-circle"
          data-dashboard-pizza="true"
          role="img"
          aria-label="Distribuição das quantidades por produto"
          style={{ background: gradiente }}
        />
        <div className="w-100">
          {fatias.map((item) => (
            <div
              className="d-flex align-items-center gap-2 border-bottom py-2"
              key={`${item.produto_id}-${item.produto_generico_id}`}
            >
              <span
                aria-hidden="true"
                style={{ width: 12, height: 12, backgroundColor: item.cor }}
              />
              <span className="small fw-semibold flex-grow-1">
                {item.produto}
              </span>
              <span className="small text-body-secondary">
                {item.percentual.toLocaleString("pt-BR", {
                  maximumFractionDigits: 1,
                })}
                %
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-grafico d-flex flex-column gap-3">
      {ranking.map((item) => (
        <div key={`${item.produto_id}-${item.produto_generico_id}`}>
          <div className="d-flex justify-content-between small mb-1">
            <span className="fw-semibold text-truncate">{item.produto}</span>
            <span>
              {item.quantidade.toLocaleString("pt-BR", {
                maximumFractionDigits: 3,
              })}{" "}
              {item.unidade}
            </span>
          </div>
          <div
            className="progress"
            role="progressbar"
            aria-label={`Quantidade de ${item.produto}`}
          >
            <div
              key={`${item.produto_id}-${item.produto_generico_id}-${animacao}`}
              className={`progress-bar dashboard-barra-preenchimento ${variante === "comparacao" ? "dashboard-barra-comparacao" : "dashboard-barra-principal"}`}
              style={
                {
                  "--barra-final": `${Math.max((item.quantidade / maiorQuantidade) * 100, 2)}%`,
                } as CSSProperties
              }
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function DashboardPage() {
  const [dashboard, setDashboard] =
    useState<DashboardLancamentoResponse>(dashboardVazio);
  const [dashboardComparacao, setDashboardComparacao] =
    useState<DashboardLancamentoResponse>(dashboardVazio);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [produtosGenericos, setProdutosGenericos] = useState<ProdutoGenerico[]>(
    [],
  );
  const [produtosMercearia, setProdutosMercearia] = useState<
    ProdutoMercearia[]
  >([]);
  const [produtosDepartamento, setProdutosDepartamento] = useState<
    ProdutoDepartamento[]
  >([]);
  const [tipo, setTipo] = useState("");
  const [dataInicio, setDataInicio] = useState(periodoInicial.inicio);
  const [dataFim, setDataFim] = useState(periodoInicial.fim);
  const [dataInicioComparacao, setDataInicioComparacao] = useState("");
  const [dataFimComparacao, setDataFimComparacao] = useState("");
  const [departamentoID, setDepartamentoID] = useState("");
  const [produtoID, setProdutoID] = useState("");
  const [produtoGenericoID, setProdutoGenericoID] = useState("");
  const [pesquisa, setPesquisa] = useState("");
  const [visualizacao, setVisualizacao] = useState<"barras" | "pizza">(
    "barras",
  );
  const [animacaoGrafico, setAnimacaoGrafico] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  async function buscarDashboard() {
    setCarregando(true);
    setErro("");
    try {
      const filtros = {
        ...(tipo ? { tipo: tipo as "QUEBRA" | "TRANSFERENCIA" } : {}),
        ...(dataInicio ? { data_inicio: dataInicio } : {}),
        ...(dataFim ? { data_fim: dataFim } : {}),
        ...(departamentoID ? { departamento_id: Number(departamentoID) } : {}),
        ...(produtoID ? { produto_id: Number(produtoID) } : {}),
        ...(produtoGenericoID
          ? { produto_generico_id: Number(produtoGenericoID) }
          : {}),
      };

      const resultado = await dashboardService.buscarLancamentos({
        ...filtros,
      });

      const dashboardSegura: DashboardLancamentoResponse = {
        filtros: resultado?.filtros ?? dashboardVazio.filtros,
        resumo: resultado?.resumo ?? dashboardVazio.resumo,
        ranking: resultado?.ranking ?? [],
      };

      setDashboard(dashboardSegura);
      setAnimacaoGrafico((atual) => atual + 1);

      if (dataInicioComparacao && dataFimComparacao) {
        const comparacao = await dashboardService.buscarLancamentos({
          ...filtros,
          data_inicio: dataInicioComparacao,
          data_fim: dataFimComparacao,
        });

        setDashboardComparacao({
          filtros: comparacao?.filtros ?? dashboardVazio.filtros,
          resumo: comparacao?.resumo ?? dashboardVazio.resumo,
          ranking: comparacao?.ranking ?? [],
        });
      } else {
        setDashboardComparacao(dashboardVazio);
      }
    } catch {
      setErro("Não foi possível carregar os dados do dashboard.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    async function carregarFiltros() {
      try {
        const [
          departamentosData,
          genericosData,
          merceariaData,
          departamentoData,
        ] = await Promise.all([
          departamentoService.buscarTodos(),
          produtoGenericoService.buscarTodos(),
          produtoMerceariaService.buscarTodos(),
          produtoDepartamentoService.buscarTodos(),
        ]);
        const departamentosSemDuplicatas = departamentosData.filter(
          (departamento, index, departamentos) =>
            departamentos.findIndex(
              (item) =>
                item.nome.trim().toLowerCase() ===
                departamento.nome.trim().toLowerCase(),
            ) === index,
        );
        setDepartamentos(departamentosSemDuplicatas);
        setProdutosGenericos(genericosData);
        setProdutosMercearia(merceariaData);
        setProdutosDepartamento(departamentoData);
      } catch {
        setErro("Não foi possível carregar as opções de filtro.");
      }
    }

    async function carregarDashboardInicial() {
      setCarregando(true);

      try {
        const resultado = await dashboardService.buscarLancamentos({
          data_inicio: periodoInicial.inicio,
          data_fim: periodoInicial.fim,
        });

        const dashboardSegura: DashboardLancamentoResponse = {
          filtros: resultado?.filtros ?? dashboardVazio.filtros,
          resumo: resultado?.resumo ?? dashboardVazio.resumo,
          ranking: resultado?.ranking ?? [],
        };

        setDashboard(dashboardSegura);
        setAnimacaoGrafico((atual) => atual + 1);
      } catch {
        setErro("Não foi possível carregar os dados do dashboard.");
      } finally {
        setCarregando(false);
      }
    }

    void carregarFiltros();
    void carregarDashboardInicial();
  }, []);

  const ranking = useMemo(() => {
    const termo = pesquisa.trim().toLowerCase();
    return termo
      ? dashboard.ranking.filter((item) =>
          item.produto.toLowerCase().includes(termo),
        )
      : dashboard.ranking;
  }, [dashboard.ranking, pesquisa]);

  const rankingComparacao = useMemo(() => {
    const termo = pesquisa.trim().toLowerCase();
    return termo
      ? dashboardComparacao.ranking.filter((item) =>
          item.produto.toLowerCase().includes(termo),
        )
      : dashboardComparacao.ranking;
  }, [dashboardComparacao.ranking, pesquisa]);

  async function limparFiltros() {
    setTipo("");
    setDataInicio("");
    setDataFim("");
    setDataInicioComparacao("");
    setDataFimComparacao("");
    setDepartamentoID("");
    setProdutoID("");
    setProdutoGenericoID("");
    setPesquisa("");
    setCarregando(true);
    setErro("");
    try {
      const resultado = await dashboardService.buscarLancamentos({});
      setDashboard({
        filtros: resultado?.filtros ?? dashboardVazio.filtros,
        resumo: resultado?.resumo ?? dashboardVazio.resumo,
        ranking: resultado?.ranking ?? [],
      });
      setDashboardComparacao(dashboardVazio);
      setAnimacaoGrafico((atual) => atual + 1);
    } catch {
      setErro("Não foi possível carregar os dados do dashboard.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="dashboard-shell container-fluid px-0">
      <div className="border-bottom pb-3 mb-4">
        <p className="text-uppercase text-primary fw-semibold small mb-1">
          Análise operacional
        </p>
        <h1 className="h2 mb-1">Dashboard de lançamentos</h1>
        <p className="text-body-secondary mb-0">
          Acompanhe quebras e transferências por período, produto e
          departamento.
        </p>
      </div>

      <form
        className="dashboard-filtros card border-0 shadow-sm mb-4"
        onSubmit={(event) => {
          event.preventDefault();
          void buscarDashboard();
        }}
      >
        <div className="card-body">
          <div className="dashboard-filtros-grid row g-3">
            <div className="col-12 col-md-4 col-xl-2">
              <label className="form-label" htmlFor="dashboard-tipo">
                Tipo
              </label>
              <select
                id="dashboard-tipo"
                className="form-select"
                value={tipo}
                onChange={(event) => setTipo(event.target.value)}
              >
                <option value="">Todos</option>
                <option value="QUEBRA">Quebra</option>
                <option value="TRANSFERENCIA">Transferência</option>
              </select>
            </div>
            <div className="col-6 col-md-4 col-xl-2">
              <label className="form-label" htmlFor="dashboard-inicio">
                Data inicial
              </label>
              <input
                id="dashboard-inicio"
                type="date"
                className="form-control"
                value={dataInicio}
                onChange={(event) => setDataInicio(event.target.value)}
              />
            </div>
            <div className="col-6 col-md-4 col-xl-2">
              <label className="form-label" htmlFor="dashboard-fim">
                Data final
              </label>
              <input
                id="dashboard-fim"
                type="date"
                className="form-control"
                value={dataFim}
                onChange={(event) => setDataFim(event.target.value)}
              />
            </div>
            <div className="col-6 col-md-4 col-xl-2">
              <label
                className="form-label"
                htmlFor="dashboard-inicio-comparacao"
              >
                Comparação: início
              </label>
              <input
                id="dashboard-inicio-comparacao"
                type="date"
                className="form-control"
                value={dataInicioComparacao}
                onChange={(event) =>
                  setDataInicioComparacao(event.target.value)
                }
              />
            </div>
            <div className="col-6 col-md-4 col-xl-2">
              <label className="form-label" htmlFor="dashboard-fim-comparacao">
                Comparação: final
              </label>
              <input
                id="dashboard-fim-comparacao"
                type="date"
                className="form-control"
                value={dataFimComparacao}
                onChange={(event) => setDataFimComparacao(event.target.value)}
              />
            </div>
            <div className="col-12 col-md-4 col-xl-2">
              <label className="form-label" htmlFor="dashboard-departamento">
                Departamento
              </label>
              <select
                id="dashboard-departamento"
                className="form-select"
                value={departamentoID}
                onChange={(event) => setDepartamentoID(event.target.value)}
              >
                <option value="">Todos</option>
                {departamentos.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nome}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-4 col-xl-2">
              <label className="form-label" htmlFor="dashboard-generico">
                Produto Base
              </label>
              <select
                id="dashboard-generico"
                className="form-select"
                value={produtoGenericoID}
                onChange={(event) => setProdutoGenericoID(event.target.value)}
              >
                <option value="">Todos</option>
                {produtosGenericos.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nome}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-4 col-xl-2">
              <label className="form-label" htmlFor="dashboard-produto">
                Produto
              </label>
              <select
                id="dashboard-produto"
                className="form-select"
                value={produtoID}
                onChange={(event) => setProdutoID(event.target.value)}
              >
                <option value="">Todos</option>
                {produtosMercearia.map((item) => (
                  <option key={`m-${item.id}`} value={item.id}>
                    {item.descricao}
                  </option>
                ))}
                {produtosDepartamento.map((item) => (
                  <option key={`d-${item.id}`} value={item.id}>
                    {item.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="d-flex flex-wrap gap-2 justify-content-end mt-3">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => void limparFiltros()}
            >
              Limpar
            </button>
            <button type="submit" className="btn btn-primary">
              Aplicar filtros
            </button>
          </div>
        </div>
      </form>

      {erro && <div className="alert alert-danger">{erro}</div>}
      {carregando ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Carregando</span>
          </div>
        </div>
      ) : (
        <>
          <div className="row g-3 mb-4">
            <div className="col-12 col-md-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <p className="text-body-secondary mb-2">
                    Quantidade agregada (KG)
                  </p>
                  <strong className="display-6">
                    {(dashboard?.resumo?.total_quantidade ?? 0).toLocaleString(
                      "pt-BR",
                      { maximumFractionDigits: 3 },
                    )}
                  </strong>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <p className="text-body-secondary mb-2">
                    Lançamentos considerados
                  </p>
                  <strong className="display-6">
                    {dashboard?.resumo?.quantidade_registros ?? 0}
                  </strong>
                </div>
              </div>
            </div>
          </div>
          <div className="dashboard-graficos row g-4">
            <div className="col-12 col-xl-6">
              <div className="dashboard-grafico-card dashboard-grafico-principal card border-0 shadow-sm">
                <div className="card-body">
                  <div className="d-flex flex-wrap gap-3 justify-content-between align-items-center mb-4">
                    <div>
                      <h2 className="h5 mb-1">Ranking de produtos</h2>
                      <p className="text-body-secondary small mb-0">
                        Maior volume agregado primeiro.
                      </p>
                    </div>
                    <div className="d-flex flex-wrap gap-2 align-items-center">
                      <div
                        className="btn-group"
                        role="group"
                        aria-label="Tipo de gráfico"
                      >
                        <button
                          type="button"
                          className={`btn btn-sm ${visualizacao === "barras" ? "btn-primary" : "btn-outline-primary"}`}
                          aria-pressed={visualizacao === "barras"}
                          onClick={() => setVisualizacao("barras")}
                        >
                          Barras
                        </button>
                        <button
                          type="button"
                          className={`btn btn-sm ${visualizacao === "pizza" ? "btn-primary" : "btn-outline-primary"}`}
                          aria-pressed={visualizacao === "pizza"}
                          onClick={() => setVisualizacao("pizza")}
                        >
                          Pizza
                        </button>
                      </div>
                      <input
                        className="form-control"
                        style={{ maxWidth: 280 }}
                        placeholder="Pesquisar no resultado"
                        value={pesquisa}
                        onChange={(event) => setPesquisa(event.target.value)}
                      />
                    </div>
                  </div>
                  {ranking.length === 0 ? (
                    <div className="alert alert-light border mb-0">
                      Nenhum resultado encontrado para os filtros aplicados.
                    </div>
                  ) : (
                    <GraficoRanking
                      key={`principal-${animacaoGrafico}`}
                      ranking={ranking}
                      visualizacao={visualizacao}
                      animacao={animacaoGrafico}
                      variante="principal"
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="col-12 col-xl-6">
              <div className="dashboard-grafico-card dashboard-grafico-comparacao card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="mb-4">
                    <h2 className="h5 mb-1">Período de comparação</h2>
                    <p className="text-body-secondary small mb-0">
                      {dataInicioComparacao && dataFimComparacao
                        ? `${dataInicioComparacao} até ${dataFimComparacao}`
                        : "Informe o segundo intervalo para comparar."}
                    </p>
                  </div>
                  {dataInicioComparacao && dataFimComparacao ? (
                    <>
                      <div className="d-flex justify-content-between border-bottom pb-3 mb-4">
                        <span className="text-body-secondary">
                          Quantidade agregada
                        </span>
                        <strong>
                          {(
                            dashboardComparacao?.resumo?.total_quantidade ?? 0
                          ).toLocaleString("pt-BR", {
                            maximumFractionDigits: 3,
                          })}{" "}
                          kg
                        </strong>
                      </div>
                      {rankingComparacao.length === 0 ? (
                        <div className="alert alert-light border mb-0">
                          Nenhum resultado no período de comparação.
                        </div>
                      ) : (
                        <GraficoRanking
                          key={`comparacao-${animacaoGrafico}`}
                          ranking={rankingComparacao}
                          visualizacao={visualizacao}
                          animacao={animacaoGrafico}
                          variante="comparacao"
                        />
                      )}
                    </>
                  ) : (
                    <div className="alert alert-light border mb-0">
                      Selecione as datas de comparação e aplique os filtros.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default DashboardPage;
