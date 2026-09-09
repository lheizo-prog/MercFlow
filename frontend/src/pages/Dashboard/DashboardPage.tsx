import { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import dashboardService from "../../services/dashboardService";
import departamentoService from "../../services/departamentoService";
import { useAuth } from "../../hooks/useAuth";
import type {
  DashboardLancamentoResponse,
  DashboardLancamentoFiltros,
} from "../../types/Dashboard";
import type { Departamento } from "../../types/Departamento";
import { GraficoBarras } from "../../components/dashboard/GraficoBarras";
import { GraficoPizza } from "../../components/dashboard/GraficoPizza";
import { KPIsGrid } from "../../components/dashboard/KPIsGrid";
import { FiltrosDashboard } from "../../components/dashboard/FiltrosDashboard";
import { ComparativoLojas } from "../../components/dashboard/ComparativoLojas";
import { formatarDataHora } from "../../utils/format";

const vazio: DashboardLancamentoResponse = {
  filtros: { tipo: undefined, data_inicio: "", data_fim: "", departamento_id: 0, produto_id: 0, produto_generico_id: 0 },
  resumo: { total_quantidade: 0, quantidade_registros: 0 },
  ranking: [],
};

function DashboardPage() {
  const { isAdmin } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardLancamentoResponse>(vazio);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    tipo: "" as "" | "QUEBRA" | "TRANSFERENCIA",
    dataInicio: "",
    dataFim: "",
    departamentoId: 0,
    produtoGenericoId: 0,
  });

  useEffect(() => {
    departamentoService.buscarTodos().then(setDepartamentos).catch(() => {});
  }, []);

  useEffect(() => {
    const apiFiltros: DashboardLancamentoFiltros = {
      tipo: filtros.tipo || undefined,
      data_inicio: filtros.dataInicio || undefined,
      data_fim: filtros.dataFim || undefined,
      departamento_id: filtros.departamentoId || undefined,
      produto_generico_id: filtros.produtoGenericoId || undefined,
    };
    setLoading(true);
    dashboardService.buscarLancamentos(apiFiltros)
      .then(setDashboard)
      .catch(() => setDashboard(vazio))
      .finally(() => setLoading(false));
  }, [filtros]);

  const totalProdutos = new Set(dashboard.ranking.map((i) => i.produto_generico_id || i.produto_id)).size;

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">Dashboard</h1>
        <div className="text-muted small d-flex align-items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16" className="me-1">
            <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71V3.5z"/>
            <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
          </svg>
          {formatarDataHora()}
        </div>
      </div>

      <KPIsGrid
        totalQuantidade={dashboard.resumo.total_quantidade}
        quantidadeRegistros={dashboard.resumo.quantidade_registros}
        totalProdutos={totalProdutos}
        loading={loading}
      />

      <FiltrosDashboard
        departamentos={departamentos}
        filtros={filtros}
        onFiltrosChanged={setFiltros}
      />

      {isAdmin && (
        <ComparativoLojas
          filtros={{
            dataInicio: filtros.dataInicio || undefined,
            dataFim: filtros.dataFim || undefined,
            departamentoId: filtros.departamentoId || undefined,
            tipo: filtros.tipo,
          }}
        />
      )}

      <div className="row g-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom">
              <h5 className="mb-0">Ranking de Produtos</h5>
            </div>
            <div className="card-body">
              {dashboard.ranking.length > 0 ? (
                <>
                  <GraficoBarras ranking={dashboard.ranking} />
                  <GraficoPizza ranking={dashboard.ranking} />
                </>
              ) : (
                <div className="text-center py-5 text-body-secondary">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16" className="mb-3 opacity-25">
                    <path d="M0 0h1v15h15v1H0V0Zm14.817 3.113a.5.5 0 0 1 .07.704l-4.5 5.5a.5.5 0 0 1-.74.037L7.06 6.767l-3.656 5.027a.5.5 0 0 1-.808-.588l4-5.5a.5.5 0 0 1 .758-.06l2.609 2.61 4.15-5.073a.5.5 0 0 1 .704-.07Z"/>
                  </svg>
                  <p className="mb-0">Nenhum dado encontrado para os filtros selecionados.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}

export default DashboardPage;
