import { useEffect, useState } from "react";
import { Container } from "react-bootstrap";
import dashboardService from "../../services/dashboardService";
import departamentoService from "../../services/departamentoService";
import type { DashboardLancamentoResponse, DashboardLancamentoFiltros } from "../../types/Dashboard";
import type { Departamento } from "../../types/Departamento";
import { GraficoBarras } from "../../components/dashboard/GraficoBarras";
import { GraficoPizza } from "../../components/dashboard/GraficoPizza";
import { KPIsGrid } from "../../components/dashboard/KPIsGrid";
import { FiltrosDashboard } from "../../components/dashboard/FiltrosDashboard";

const vazio: DashboardLancamentoResponse = { filtros: { tipo: "", data_inicio: "", data_fim: "", departamento_id: 0, produto_id: 0, produto_generico_id: 0 }, resumo: { total_quantidade: 0, quantidade_registros: 0 }, ranking: [] };

function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardLancamentoResponse>(vazio);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({ tipo: "" as "" | "QUEBRA" | "TRANSFERENCIA", dataInicio: "", dataFim: "", departamentoId: 0, produtoGenericoId: 0 });

  useEffect(() => { departamentoService.buscarTodos().then(setDepartamentos).catch(() => {}); }, []);
  useEffect(() => {
    const apiFiltros: DashboardLancamentoFiltros = {
      tipo: filtros.tipo || undefined,
      data_inicio: filtros.dataInicio || undefined,
      data_fim: filtros.dataFim || undefined,
      departamento_id: filtros.departamentoId || undefined,
      produto_generico_id: filtros.produtoGenericoId || undefined,
    };
    setLoading(true);
    dashboardService.buscarLancamentos(apiFiltros).then(setDashboard).catch(() => setDashboard(vazio)).finally(() => setLoading(false));
  }, [filtros]);

  const totalProdutos = new Set(dashboard.ranking.map((i) => i.produto_generico_id || i.produto_id)).size;
  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4"><h1 className="h3 mb-0">Dashboard</h1><div className="text-muted small">{new Date().toLocaleTimeString("pt-BR")}</div></div>
      <KPIsGrid totalQuantidade={dashboard.resumo.total_quantidade} quantidadeRegistros={dashboard.resumo.quantidade_registros} totalProdutos={totalProdutos} loading={loading} />
      <FiltrosDashboard departamentos={departamentos} filtros={filtros} onFiltrosChanged={setFiltros} />
      <div className="row g-4">
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body"><h5 className="card-title mb-4">Ranking</h5>
              {dashboard.ranking.length > 0 ? <><GraficoBarras ranking={dashboard.ranking} /><GraficoPizza ranking={dashboard.ranking} /></> : <div className="text-center py-4">Nenhum dado</div>}
            </div>
          </div>
        </div>
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body"><h5 className="card-title mb-4">Resumo</h5>
              <div className="p-3 bg-light border rounded">
                <div className="d-flex justify-content-between"><span className="text-body-secondary small">Total</span><div className="fw-bold">{dashboard.resumo.total_quantidade.toLocaleString("pt-BR")} kg</div></div>
                <div className="d-flex justify-content-between mt-2"><span className="text-body-secondary small">Registros</span><div className="fw-bold">{dashboard.resumo.quantidade_registros.toLocaleString("pt-BR")}</div></div>
                <div className="d-flex justify-content-between mt-2"><span className="text-body-secondary small">Produtos</span><div className="fw-bold">{totalProdutos.toLocaleString("pt-BR")}</div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
export default DashboardPage;
