import type { Departamento } from "../../types/Departamento";

interface FiltrosType {
  tipo: "" | "QUEBRA" | "TRANSFERENCIA";
  dataInicio: string;
  dataFim: string;
  departamentoId: number;
  produtoGenericoId: number;
}
interface Props {
  departamentos: Departamento[];
  filtros: FiltrosType;
  onFiltrosChanged: (filtros: FiltrosType) => void;
}



export function FiltrosDashboard({
  departamentos,
  filtros,
  onFiltrosChanged,
}: Props) {
  const temFiltroAtivo = Boolean(filtros.tipo || filtros.dataInicio || filtros.dataFim || filtros.departamentoId);

  const limparFiltros = () => {
    onFiltrosChanged({
      tipo: "",
      dataInicio: "",
      dataFim: "",
      departamentoId: 0,
      produtoGenericoId: 0,
    });
  };

  return (
    <div className="card border-0 shadow-sm overflow-hidden">
      <div className="card-header bg-white border-bottom py-3 px-4 d-flex align-items-center justify-content-between flex-wrap gap-2">
        <div className="d-flex align-items-center gap-2">
          <span className="p-2 rounded-2 bg-primary-subtle text-primary d-inline-flex">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </span>
          <h5 className="mb-0 fw-bold text-dark" style={{ fontSize: "1rem" }}>Filtros de Análise</h5>
          {temFiltroAtivo && (
            <span className="badge bg-primary-subtle text-primary border border-primary-subtle ms-1" style={{ fontSize: "0.7rem" }}>
              Filtro ativo
            </span>
          )}
        </div>

        {temFiltroAtivo && (
          <button
            type="button"
            onClick={limparFiltros}
            className="btn btn-sm btn-link text-secondary text-decoration-none p-0 d-flex align-items-center gap-1"
            style={{ fontSize: "0.825rem" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>Limpar filtros</span>
          </button>
        )}
      </div>

      <div className="card-body p-3 p-sm-4 bg-white">
        <div className="row g-3">
          <div className="col-12 col-sm-6 col-lg-3">
            <label className="form-label small fw-semibold text-secondary mb-1 d-flex align-items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-primary">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span>Tipo de Operação</span>
            </label>
            <select
              className="form-select form-select-sm"
              value={filtros.tipo}
              onChange={(e) =>
                onFiltrosChanged({
                  ...filtros,
                  tipo: e.target.value as FiltrosType["tipo"],
                })
              }
            >
              <option value="">Todos os tipos</option>
              <option value="QUEBRA">Quebra</option>
              <option value="TRANSFERENCIA">Transferência</option>
            </select>
          </div>

          <div className="col-12 col-sm-6 col-lg-3">
            <label className="form-label small fw-semibold text-secondary mb-1 d-flex align-items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-primary">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Data Início</span>
            </label>
            <input
              type="date"
              className="form-control form-control-sm"
              value={filtros.dataInicio}
              onChange={(e) =>
                onFiltrosChanged({ ...filtros, dataInicio: e.target.value })
              }
            />
          </div>

          <div className="col-12 col-sm-6 col-lg-3">
            <label className="form-label small fw-semibold text-secondary mb-1 d-flex align-items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-primary">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Data Fim</span>
            </label>
            <input
              type="date"
              className="form-control form-control-sm"
              value={filtros.dataFim}
              onChange={(e) =>
                onFiltrosChanged({ ...filtros, dataFim: e.target.value })
              }
            />
          </div>

          <div className="col-12 col-sm-6 col-lg-3">
            <label className="form-label small fw-semibold text-secondary mb-1 d-flex align-items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-primary">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span>Departamento</span>
            </label>
            <select
              className="form-select form-select-sm"
              value={filtros.departamentoId}
              onChange={(e) =>
                onFiltrosChanged({
                  ...filtros,
                  departamentoId: Number(e.target.value),
                })
              }
            >
              <option value={0}>Todos os departamentos</option>
              {departamentos.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nome}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
