interface KPIProps {
  title: string;
  value: string | number;
  icon?: "scale" | "list" | "box" | "graph";
  variant?: "primary" | "success" | "info";
  subtitle?: string;
}

const icons = {
  scale: (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
    </svg>
  ),
  list: (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  box: (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  graph: (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
};

const stylesByVariant: Record<string, { bgIcon: string; textIcon: string; borderTop: string; gradient: string }> = {
  primary: {
    bgIcon: "#eff6ff",
    textIcon: "#2563eb",
    borderTop: "#2563eb",
    gradient: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
  },
  success: {
    bgIcon: "#ecfdf5",
    textIcon: "#059669",
    borderTop: "#059669",
    gradient: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
  },
  info: {
    bgIcon: "#f0fdfa",
    textIcon: "#0d9488",
    borderTop: "#0d9488",
    gradient: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
  },
};

function KPI({
  title,
  value,
  icon = "graph",
  variant = "primary",
  subtitle,
}: KPIProps) {
  const cfg = stylesByVariant[variant] || stylesByVariant.primary;

  return (
    <div
      className="card border-0 h-100 position-relative overflow-hidden"
      style={{
        borderTop: `3px solid ${cfg.borderTop}`,
        background: cfg.gradient,
        boxShadow: "0 2px 8px -2px rgba(15, 23, 42, 0.06), 0 1px 4px -1px rgba(15, 23, 42, 0.04)",
        transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 10px 22px -3px rgba(15, 23, 42, 0.1), 0 4px 8px -2px rgba(15, 23, 42, 0.06)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 8px -2px rgba(15, 23, 42, 0.06), 0 1px 4px -1px rgba(15, 23, 42, 0.04)";
      }}
    >
      <div className="card-body d-flex align-items-center gap-3 p-3 p-sm-4">
        <div
          className="flex-shrink-0 d-flex align-items-center justify-content-center rounded-3 shadow-xs"
          style={{
            width: "52px",
            height: "52px",
            backgroundColor: cfg.bgIcon,
            color: cfg.textIcon,
            border: `1px solid ${cfg.bgIcon === "#eff6ff" ? "#dbeafe" : "#d1fae5"}`,
          }}
        >
          {icons[icon]}
        </div>
        <div className="flex-grow-1 min-w-0">
          <div className="text-secondary small fw-semibold text-uppercase mb-1 text-truncate" style={{ letterSpacing: "0.5px", fontSize: "0.72rem" }}>
            {title}
          </div>
          <div className="h3 mb-0 fw-bold text-dark text-truncate" style={{ letterSpacing: "-0.03em" }}>
            {typeof value === "number"
              ? value.toLocaleString("pt-BR", { maximumFractionDigits: 2 })
              : value}
          </div>
          {subtitle && (
            <div className="text-muted small mt-1 text-truncate" style={{ fontSize: "0.8rem" }}>
              {subtitle}
            </div>
          )}
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

export function KPIsGrid({
  totalQuantidade,
  quantidadeRegistros,
  totalProdutos,
  loading = false,
}: Props) {
  if (loading) {
    return (
      <div className="row g-3 mb-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="col-12 col-md-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4 d-flex align-items-center gap-3">
                <div
                  className="placeholder bg-secondary rounded-3"
                  style={{ width: "52px", height: "52px", opacity: 0.15 }}
                />
                <div className="flex-grow-1">
                  <div
                    className="placeholder bg-secondary rounded w-50"
                    style={{ height: "14px", opacity: 0.2 }}
                  />
                  <div
                    className="placeholder bg-secondary rounded w-75 mt-2"
                    style={{ height: "26px", opacity: 0.3 }}
                  />
                </div>
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
        <KPI
          title="Quantidade Total"
          value={totalQuantidade}
          icon="scale"
          variant="primary"
          subtitle="kg / unidades lançadas"
        />
      </div>
      <div className="col-12 col-md-4">
        <KPI
          title="Total de Lançamentos"
          value={quantidadeRegistros}
          icon="list"
          variant="success"
          subtitle="registros no período"
        />
      </div>
      <div className="col-12 col-md-4">
        <KPI
          title="Produtos Movimentados"
          value={totalProdutos}
          icon="box"
          variant="info"
          subtitle="itens distintos apurados"
        />
      </div>
    </div>
  );
}
