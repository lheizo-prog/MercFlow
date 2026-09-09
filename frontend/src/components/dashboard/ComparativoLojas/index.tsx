import { useEffect, useMemo, useState } from "react";
import type { ChartOptions, TooltipItem } from "chart.js";
import { Bar } from "react-chartjs-2";
import lojaService from "../../../services/lojaService";
import dashboardService from "../../../services/dashboardService";
import type { Loja } from "../../../types/Loja";
import type { DashboardLojaData, DashboardLancamentoFiltros } from "../../../types/Dashboard";
import { ModalComparativo } from "../../common/ModalComparativo";
import { useNavigate } from "react-router-dom";
import type { ComparativoDuasLojasConfig, ComparativoMesmaLojaConfig } from "../../../types/Comparativo";

type ComparativoConfig = ComparativoDuasLojasConfig | ComparativoMesmaLojaConfig;

interface Props {
  filtros: {
    dataInicio?: string;
    dataFim?: string;
    departamentoId?: number;
    tipo?: "" | "QUEBRA" | "TRANSFERENCIA";
  };
}

export function ComparativoLojas({ filtros }: Props) {
  const navigate = useNavigate();
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [dados, setDados] = useState<DashboardLojaData[]>([]);
  const [loading, setLoading] = useState(false);
  const [ordenacao, setOrdenacao] = useState<"quantidade" | "registros" | "produtos" | "nome">("quantidade");
  const [direcao, setDirecao] = useState<"asc" | "desc">("desc");
  const [modalAberto, setModalAberto] = useState(false);

  useEffect(() => {
    lojaService.listar()
      .then((res) => setLojas(res.filter((l) => l.ativo)))
      .catch(() => setLojas([]));
  }, []);

  useEffect(() => {
    if (lojas.length === 0) {
      setDados([]);
      return;
    }

    const apiFiltrosBase: DashboardLancamentoFiltros = {
      data_inicio: filtros.dataInicio || undefined,
      data_fim: filtros.dataFim || undefined,
      departamento_id: filtros.departamentoId || undefined,
      tipo: filtros.tipo || undefined,
    };

    setLoading(true);

    Promise.all(
      lojas.map(async (loja) => {
        try {
          const res = await dashboardService.buscarLancamentos({
            ...apiFiltrosBase,
            loja_ids: String(loja.id),
          });
          const produtosDistintos = new Set(
            res.ranking.map((i: { produto_generico_id: number; produto_id: number }) => i.produto_generico_id || i.produto_id),
          ).size;
          return {
            loja_id: loja.id,
            loja_nome: loja.nome,
            total_quantidade: Number(res.resumo.total_quantidade) || 0,
            quantidade_registros: res.resumo.quantidade_registros || 0,
            produtos_distintos: produtosDistintos,
          } satisfies DashboardLojaData;
        } catch {
          return {
            loja_id: loja.id,
            loja_nome: loja.nome,
            total_quantidade: 0,
            quantidade_registros: 0,
            produtos_distintos: 0,
          } satisfies DashboardLojaData;
        }
      }),
    )
      .then(setDados)
      .finally(() => setLoading(false));
  }, [lojas, filtros.dataInicio, filtros.dataFim, filtros.departamentoId, filtros.tipo]);

  const totalGeral = useMemo(() => {
    return dados.reduce(
      (acc, item) => ({
        total_quantidade: acc.total_quantidade + item.total_quantidade,
        quantidade_registros: acc.quantidade_registros + item.quantidade_registros,
        produtos_distintos: acc.produtos_distintos + item.produtos_distintos,
      }),
      { total_quantidade: 0, quantidade_registros: 0, produtos_distintos: 0 },
    );
  }, [dados]);

  const dadosOrdenados = useMemo(() => {
    return [...dados].sort((a, b) => {
      const dir = direcao === "desc" ? -1 : 1;
      switch (ordenacao) {
        case "quantidade": return (a.total_quantidade - b.total_quantidade) * dir;
        case "registros": return (a.quantidade_registros - b.quantidade_registros) * dir;
        case "produtos": return (a.produtos_distintos - b.produtos_distintos) * dir;
        case "nome": return a.loja_nome.localeCompare(b.loja_nome) * dir;
      }
    });
  }, [dados, ordenacao, direcao]);

  const maxQuantidade = Math.max(...dados.map((d) => d.total_quantidade), 1);

  function handleGerar(config: ComparativoConfig) {
    setModalAberto(false);
    navigate("/comparativo", { state: { config } });
  }

  const headerIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" className="me-2">
      <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 0 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 0 1 1-1h8zM5 12.25v3.25a.25.25 0 0 0 .4.2l1.45-1.087a.249.249 0 0 1 .3 0L8.6 15.7a.25.25 0 0 0 .4-.2v-3.25a.25.25 0 0 0-.25-.25h-3.5a.25.25 0 0 0-.25.25z"/>
    </svg>
  );

  if (loading && dados.length === 0) {
    return (
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-white border-bottom">
          <h5 className="mb-0 d-flex align-items-center">{headerIcon}Comparativo entre Lojas</h5>
        </div>
        <div className="card-body">
          <div className="placeholder-glow">
            <div className="row g-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="col-12 col-md-6 col-lg-4">
                  <div className="placeholder bg-secondary rounded" style={{ height: "120px" }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (lojas.length === 0) {
    return (
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-white border-bottom">
          <h5 className="mb-0 d-flex align-items-center">{headerIcon}Comparativo entre Lojas</h5>
        </div>
        <div className="card-body">
          <div className="text-center text-body-secondary py-4">Nenhuma loja ativa cadastrada.</div>
        </div>
      </div>
    );
  }

  const chartData = {
    labels: dadosOrdenados.map((d) => d.loja_nome),
    datasets: [
      {
        label: "Quantidade Total",
        data: dadosOrdenados.map((d) => d.total_quantidade),
        backgroundColor: "rgba(13, 110, 253, 0.7)",
        borderColor: "rgba(13, 110, 253, 1)",
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  };

  const chartOptions: ChartOptions<"bar"> = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (ctx: TooltipItem<"bar">) => {
            const item = dadosOrdenados[ctx.dataIndex];
            return [
              `Quantidade: ${item.total_quantidade.toLocaleString("pt-BR")}`,
              `Registros: ${item.quantidade_registros.toLocaleString("pt-BR")}`,
              `Produtos: ${item.produtos_distintos.toLocaleString("pt-BR")}`,
            ];
          },
        },
      },
    },
    scales: {
      x: { grid: { color: "rgba(0, 0, 0, 0.05)" }, ticks: { font: { size: 11 } } },
      y: { grid: { display: false }, ticks: { font: { size: 11 } } },
    },
    animation: { duration: 800 },
  };

  return (
    <>
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h5 className="mb-0 d-flex align-items-center">{headerIcon}Comparativo entre Lojas</h5>
          <div className="d-flex align-items-center gap-2">
            <div className="d-flex align-items-center gap-1 me-2">
              <label className="small text-body-secondary mb-0">Ordenar:</label>
              <select
                className="form-select form-select-sm"
                value={ordenacao}
                onChange={(e) => setOrdenacao(e.target.value as typeof ordenacao)}
                style={{ width: "auto" }}
              >
                <option value="quantidade">Quantidade</option>
                <option value="registros">Registros</option>
                <option value="produtos">Produtos</option>
                <option value="nome">Nome</option>
              </select>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setDirecao(direcao === "asc" ? "desc" : "asc")}
                title={direcao === "asc" ? "Ascendente" : "Descendente"}
              >
                {direcao === "asc" ? "Asc" : "Desc"}
              </button>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-primary d-flex align-items-center gap-1"
              onClick={() => setModalAberto(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 3a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.5.5H4a.5.5 0 0 1 0-1h3.5V3.5A.5.5 0 0 1 8 3z"/>
                <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
              </svg>
              <span className="d-none d-sm-inline">Comparar Lojas</span>
              <span className="d-inline d-sm-none">Comparar</span>
            </button>
          </div>
        </div>
        <div className="card-body">
          <div className="row g-3 mb-3">
            <div className="col-12 col-md-4">
              <div className="p-3 bg-primary bg-opacity-10 border border-primary border-opacity-25 rounded text-center">
                <div className="text-primary small fw-semibold">Total Geral</div>
                <div className="h4 mb-0 fw-bold">{totalGeral.total_quantidade.toLocaleString("pt-BR")}</div>
                <div className="text-muted small">quantidade</div>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="p-3 bg-success bg-opacity-10 border border-success border-opacity-25 rounded text-center">
                <div className="text-success small fw-semibold">Registros</div>
                <div className="h4 mb-0 fw-bold">{totalGeral.quantidade_registros.toLocaleString("pt-BR")}</div>
                <div className="text-muted small">lancamentos</div>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="p-3 bg-info bg-opacity-10 border border-info border-opacity-25 rounded text-center">
                <div className="text-info small fw-semibold">Lojas Ativas</div>
                <div className="h4 mb-0 fw-bold">{dados.length}</div>
                <div className="text-muted small">no periodo</div>
              </div>
            </div>
          </div>
          <div className="row g-3 mb-4">
            {dadosOrdenados.map((loja) => {
              const percentual = (loja.total_quantidade / maxQuantidade) * 100;
              return (
                <div key={loja.loja_id} className="col-12 col-md-6 col-lg-4">
                  <div className="card border h-100">
                    <div className="card-body p-3">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h6 className="mb-0 fw-semibold text-truncate" title={loja.loja_nome}>{loja.loja_nome}</h6>
                        <span className="badge text-bg-primary">#{loja.loja_id}</span>
                      </div>
                      <div className="mb-2">
                        <div className="d-flex justify-content-between small mb-1">
                          <span className="text-body-secondary">Quantidade</span>
                          <span className="fw-bold">{loja.total_quantidade.toLocaleString("pt-BR")}</span>
                        </div>
                        <div className="progress" style={{ height: "6px" }}>
                          <div
                            className="progress-bar bg-primary"
                            role="progressbar"
                            style={{ width: `${percentual}%` }}
                            aria-valuenow={percentual}
                            aria-valuemin={0}
                            aria-valuemax={100}
                          />
                        </div>
                      </div>
                      <div className="d-flex justify-content-between small">
                        <span className="text-body-secondary">Registros</span>
                        <span className="fw-semibold">{loja.quantidade_registros.toLocaleString("pt-BR")}</span>
                      </div>
                      <div className="d-flex justify-content-between small">
                        <span className="text-body-secondary">Produtos</span>
                        <span className="fw-semibold">{loja.produtos_distintos.toLocaleString("pt-BR")}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {dadosOrdenados.length > 0 && (
            <div style={{ height: Math.max(250, dadosOrdenados.length * 40) }}>
              <Bar data={chartData} options={chartOptions} />
            </div>
          )}
        </div>
      </div>

      <ModalComparativo
        show={modalAberto}
        onHide={() => setModalAberto(false)}
        onGerar={handleGerar}
      />
    </>
  );
}


