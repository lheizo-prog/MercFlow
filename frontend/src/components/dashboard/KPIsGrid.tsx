interface KPIProps {
  title: string;
  value: string | number;
  icon?: "scale" | "list" | "box" | "graph";
  variant?: "primary" | "success" | "info";
  subtitle?: string;
}

const icons = {
  scale: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
      <path d="M8 3a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.5.5H4a.5.5 0 0 1 0-1h3.5V3.5A.5.5 0 0 1 8 3z"/>
      <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0z"/>
    </svg>
  ),
  list: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
      <path d="M5.5 8a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5zM5 10.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5z"/>
      <path d="M3 0h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-1h1v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v1H1V2a2 2 0 0 1 2-2z"/>
      <path d="M1 5v-.5a.5.5 0 0 1 1 0V5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1H1zm0 3v-.5a.5.5 0 0 1 1 0V8h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1H1zm0 3v-.5a.5.5 0 0 1 1 0v.5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1H1z"/>
    </svg>
  ),
  box: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
      <path d="M8.186 1.113a.5.5 0 0 0-.372 0L1.846 3.5 8 5.961 14.154 3.5 8.186 1.113zM15 4.7l-6.5 2.6v7.12a5.37 5.37 0 0 0 1 .06 1 1 0 0 0 .74-.31v-7.12l-6.5-2.6V4.7z"/>
      <path d="M3.5 5.875 8 8.318l4.5-2.443V11.6a1.5 1.5 0 0 0-.5-.868L8 7.934 3.5 5.875z"/>
      <path d="M3.5 2.5 8 5.072l4.5-2.572v6.286L8 11.664 3.5 9.086v-6.61l-.5.024z"/>
    </svg>
  ),
  graph: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
      <path fillRule="evenodd" d="M0 0h1v15h15v1H0V0Zm14.817 3.113a.5.5 0 0 1 .07.704l-4.5 5.5a.5.5 0 0 1-.74.037L7.06 6.767l-3.656 5.027a.5.5 0 0 1-.808-.588l4-5.5a.5.5 0 0 1 .758-.06l2.609 2.61 4.15-5.073a.5.5 0 0 1 .704-.07Z"/>
    </svg>
  ),
};

function KPI({ title, value, icon = "graph", variant = "primary", subtitle }: KPIProps) {
  const bgColors: Record<string, string> = {
    primary: "bg-primary bg-opacity-10 text-primary",
    success: "bg-success bg-opacity-10 text-success",
    info: "bg-info bg-opacity-10 text-info",
  };

  return (
    <div className="card border-0 shadow-sm h-100">
      <div className="card-body d-flex align-items-center gap-3 p-3">
        <div
          className={`flex-shrink-0 d-flex align-items-center justify-content-center rounded ${bgColors[variant]}`}
          style={{ width: "56px", height: "56px" }}
        >
          {icons[icon]}
        </div>
        <div className="flex-grow-1 min-w-0">
          <div className="text-body-secondary small mb-1 text-truncate">{title}</div>
          <div className="h4 mb-0 fw-bold text-truncate">
            {typeof value === "number"
              ? value.toLocaleString("pt-BR", { maximumFractionDigits: 2 })
              : value}
          </div>
          {subtitle && <div className="text-muted small mt-1 text-truncate">{subtitle}</div>}
        </div>
      </div>
    </div>
  );
}

interface Props {
  totalQuantidade: number;
  quantidadeRegistros: number;
  totalProdutos: number;
  loading?: boolean;
}

export function KPIsGrid({ totalQuantidade, quantidadeRegistros, totalProdutos, loading = false }: Props) {
  if (loading) {
    return (
      <div className="row g-3 mb-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="col-12 col-md-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-3">
                <div className="placeholder bg-secondary rounded" style={{ width: "60px", height: "20px" }} />
                <div className="placeholder bg-secondary rounded w-75 mt-2" style={{ height: "30px" }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="row g-3 mb-4">
      <div className="col-12 col-md-4">
        <KPI title="Quantidade Total" value={totalQuantidade} icon="scale" variant="primary" subtitle="kg / unidades" />
      </div>
      <div className="col-12 col-md-4">
        <KPI title="Registros" value={quantidadeRegistros} icon="list" variant="success" subtitle="lancamentos no periodo" />
      </div>
      <div className="col-12 col-md-4">
        <KPI title="Produtos" value={totalProdutos} icon="box" variant="info" subtitle="itens distintos" />
      </div>
    </div>
  );
}
