interface KPIProps { title: string; value: string | number; icon?: string; variant?: "primary" | "success" | "info"; subtitle?: string; }
function KPI({ title, value, icon = "📊", variant = "primary", subtitle }: KPIProps) {
  const bgColors: Record<string, string> = { primary: "bg-primary bg-opacity-10", success: "bg-success bg-opacity-10", info: "bg-info bg-opacity-10" };
  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body d-flex align-items-center gap-3 p-3">
        <div className={`flex-shrink-0 d-flex align-items-center justify-content-center rounded ${bgColors[variant]}`} style={{ width: "56px", height: "56px" }}>
          <span style={{ fontSize: "1.5rem" }}>{icon}</span>
        </div>
        <div className="flex-grow-1">
          <div className="text-body-secondary small mb-1">{title}</div>
          <div className="h4 mb-0 fw-bold">{typeof value === "number" ? value.toLocaleString("pt-BR", { maximumFractionDigits: 2 }) : value}</div>
          {subtitle && <div className="text-muted small mt-1">{subtitle}</div>}
        </div>
      </div>
    </div>
  );
}
interface Props { totalQuantidade: number; quantidadeRegistros: number; totalProdutos: number; loading?: boolean; }
export function KPIsGrid({ totalQuantidade, quantidadeRegistros, totalProdutos, loading = false }: Props) {
  if (loading) return <div className="row g-3 mb-4">{[1, 2, 3].map((i) => <div key={i} className="col-12 col-md-4"><div className="card border-0 shadow-sm"><div className="card-body"><div className="placeholder bg-secondary rounded" style={{ width: "60px", height: "20px" }}></div><div className="placeholder bg-secondary rounded w-75 mt-2" style={{ height: "30px" }}></div></div></div></div>)}</div>;
  return (
    <div className="row g-3 mb-4">
      <div className="col-12 col-md-4"><KPI title="Quantidade Total" value={totalQuantidade} subtitle="kg / unidades" icon="⚖️" variant="primary" /></div>
      <div className="col-12 col-md-4"><KPI title="Registros" value={quantidadeRegistros} subtitle="lançamentos no período" icon="📋" variant="success" /></div>
      <div className="col-12 col-md-4"><KPI title="Produtos" value={totalProdutos} subtitle="itens distintos" icon="📦" variant="info" /></div>
    </div>
  );
}
