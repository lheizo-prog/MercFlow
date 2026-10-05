import { useCallback, useEffect, useRef, useState } from "react";
import { Container, Button } from "react-bootstrap";
import dashboardService from "../../services/dashboardService";
import departamentoService from "../../services/departamentoService";
import { useAuth } from "../../hooks/useAuth";
import { useLancamentoWebSocket } from "../../hooks/useLancamentoWebSocket";
import type {
  DashboardLancamentoResponse,
  DashboardLancamentoFiltros,
} from "../../types/Dashboard";
import type { Departamento } from "../../types/Departamento";
import { GraficoBarras } from "../../components/dashboard/GraficoBarras";
import { GraficoPizza } from "../../components/dashboard/GraficoPizza";
import { KPIsGrid } from "../../components/dashboard/KPIsGrid";
import { FiltrosDashboard } from "../../components/dashboard/FiltrosDashboard";
import { useRefetchOnFocus } from "../../hooks/useRefetchOnFocus";
import { ComparativoModal } from "../../components/comparativo/ComparativoModal";
import { formatarDataHora } from "../../utils/format";

const vazio: DashboardLancamentoResponse = {
  filtros: {
    tipo: undefined,
    data_inicio: "",
    data_fim: "",
    departamento_id: 0,
    produto_id: 0,
    produto_generico_id: 0,
  },
  resumo: { total_quantidade: 0, quantidade_registros: 0 },
  ranking: [],
};

function DashboardPage() {
  const [dashboard, setDashboard] =
    useState<DashboardLancamentoResponse>(vazio);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [comparativoAberto, setComparativoAberto] = useState(false);
  const [filtros, setFiltros] = useState({
    tipo: "" as "" | "QUEBRA" | "TRANSFERENCIA",
    dataInicio: "",
    dataFim: "",
    departamentoId: 0,
    produtoGenericoId: 0,
  });

  const carregarDepartamentos = useCallback(() => {
    departamentoService
      .buscarTodos()
      .then(setDepartamentos)
      .catch(() => {});
  }, []);

  useEffect(() => {
    carregarDepartamentos();
  }, [carregarDepartamentos]);

  // Recarrega departamentos quando o usuário volta para esta aba, para o
  // filtro do dashboard não continuar oferecendo um departamento que já foi
  // excluído (ou deixar de oferecer um recém-criado) em outra sessão.
  useRefetchOnFocus(carregarDepartamentos);

  const carregarDashboardRequestId = useRef(0);

  const carregarDashboard = useCallback(() => {
    const apiFiltros: DashboardLancamentoFiltros = {
      tipo: filtros.tipo || undefined,
      data_inicio: filtros.dataInicio || undefined,
      data_fim: filtros.dataFim || undefined,
      departamento_id: filtros.departamentoId || undefined,
      produto_generico_id: filtros.produtoGenericoId || undefined,
    };
    // Guard contra respostas fora de ordem: como o dashboard agora pode ser
    // recarregado tanto pela mudança de filtros quanto por um evento WS de
    // novo lançamento, duas chamadas podem ficar em voo ao mesmo tempo. Sem
    // isso, uma resposta mais antiga que chega depois de uma mais recente
    // sobrescreveria o estado com dados desatualizados.
    const requestId = ++carregarDashboardRequestId.current;
    setLoading(true);
    dashboardService
      .buscarLancamentos(apiFiltros)
      .then((data) => {
        if (requestId !== carregarDashboardRequestId.current) return;
        setDashboard(data);
      })
      .catch(() => {
        if (requestId !== carregarDashboardRequestId.current) return;
        setDashboard(vazio);
      })
      .finally(() => {
        if (requestId !== carregarDashboardRequestId.current) return;
        setLoading(false);
      });
  }, [filtros]);

  useEffect(() => {
    carregarDashboard();
  }, [carregarDashboard]);

  const { isAuthenticated, hasPermission, isAdmin } = useAuth();
  const podeExportar = isAdmin || hasPermission("dashboard.export");
  const [exportandoCSV, setExportandoCSV] = useState(false);

  // Atualiza o dashboard automaticamente quando qualquer usuário da mesma
  // loja cria um novo lançamento, sem precisar de polling.
  useLancamentoWebSocket({
    enabled: isAuthenticated,
    onNovoLancamento: carregarDashboard,
  });

  const totalProdutos = new Set(
    dashboard.ranking.map((i) => i.produto_generico_id || i.produto_id),
  ).size;

  const handleExportarCSV = async () => {
    try {
      setExportandoCSV(true);
      const apiFiltros: DashboardLancamentoFiltros = {
        tipo: filtros.tipo || undefined,
        data_inicio: filtros.dataInicio || undefined,
        data_fim: filtros.dataFim || undefined,
        departamento_id: filtros.departamentoId || undefined,
        produto_generico_id: filtros.produtoGenericoId || undefined,
      };
      const blob = await dashboardService.exportarLancamentos(apiFiltros);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `relatorio_dashboard_${filtros.dataInicio || "inicio"}_${filtros.dataFim || "fim"}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Erro ao exportar CSV:", e);
      alert("Não foi possível exportar os dados do relatório.");
    } finally {
      setExportandoCSV(false);
    }
  };

  return (
    <Container className="py-4" id="dashboard-conteudo-export">
      {/* Cabeçalho do Dashboard */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4 pb-2 border-bottom">
        <div>
          <h1 className="h3 mb-1 fw-bold text-dark" style={{ letterSpacing: "-0.03em" }}>Dashboard</h1>
          <p className="text-secondary small mb-0">Visão consolidada de perdas, quebras e transferências</p>
        </div>
        <div className="d-flex align-items-center flex-wrap gap-2">
          <div className="badge bg-light text-secondary border px-3 py-2 fw-medium d-inline-flex align-items-center gap-2" style={{ fontSize: "0.82rem" }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="text-primary"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{formatarDataHora()}</span>
          </div>

          {podeExportar && (
            <Button
              variant="outline-success"
              size="sm"
              onClick={handleExportarCSV}
              disabled={exportandoCSV || loading}
              className="d-flex align-items-center gap-2 py-2 px-3 fw-semibold shadow-xs"
              style={{ borderRadius: "8px" }}
              title="Baixar planilha CSV para Excel / Sheets"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>{exportandoCSV ? "Exportando..." : "Exportar CSV"}</span>
            </Button>
          )}

          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => setComparativoAberto(true)}
            className="d-flex align-items-center gap-2 py-2 px-3 fw-semibold shadow-xs"
            style={{ borderRadius: "8px" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>Comparar Lojas</span>
          </Button>
        </div>
      </div>

      {/* Grid de Métricas Principais (KPIs) */}
      <KPIsGrid
        totalQuantidade={dashboard.resumo.total_quantidade}
        quantidadeRegistros={dashboard.resumo.quantidade_registros}
        totalProdutos={totalProdutos}
        loading={loading}
      />

      {/* Seção de Filtros */}
      <div className="mb-4">
        <FiltrosDashboard
          departamentos={departamentos}
          filtros={filtros}
          onFiltrosChanged={setFiltros}
        />
      </div>

      {/* Seção de Gráficos e Ranking */}
      <div className="row g-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm h-100 overflow-hidden">
            <div className="card-header bg-white border-bottom py-3 px-4 d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <span className="p-2 rounded-2 bg-primary-subtle text-primary d-inline-flex">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </span>
                <div>
                  <h5 className="mb-0 fw-bold text-dark" style={{ fontSize: "1.05rem" }}>Ranking e Distribuição de Produtos</h5>
                  <small className="text-secondary">Top produtos com maiores movimentações</small>
                </div>
              </div>
            </div>
            <div className="card-body p-4">
              {dashboard.ranking.length > 0 ? (
                <div className="row g-4">
                  <div className="col-12 col-lg-7">
                    <div className="p-3 bg-light rounded-3 h-100 border">
                      <GraficoBarras ranking={dashboard.ranking} titulo="Top 10 Produtos por Quantidade" />
                    </div>
                  </div>
                  <div className="col-12 col-lg-5">
                    <div className="p-3 bg-light rounded-3 h-100 border">
                      <GraficoPizza ranking={dashboard.ranking} titulo="Distribuição Percentual" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-5 text-body-secondary">
                  <div className="d-inline-flex p-3 rounded-circle bg-light mb-3 text-secondary">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="40"
                      height="40"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h6 className="fw-semibold text-dark">Nenhum dado encontrado</h6>
                  <p className="mb-0 small text-secondary">
                    Ajuste o período ou os filtros selecionados para visualizar os gráficos.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {comparativoAberto && (
        <ComparativoModal onClose={() => setComparativoAberto(false)} />
      )}
    </Container>
  );
}

export default DashboardPage;
