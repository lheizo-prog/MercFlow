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

interface IconeFiltroProps {
  tipo: "tipo" | "data-inicio" | "data-fim" | "departamento";
}

function IconeFiltro({ tipo }: IconeFiltroProps) {
  switch (tipo) {
    case "tipo":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16" className="me-2">
          <path d="M3 2v4.586l7 7L14.586 9l-7-7H3zM2 2a1 1 0 0 1 1-1h4.586a1 1 0 0 1 .707.293l7 7a1 1 0 0 1 0 1.414l-4.586 4.586a1 1 0 0 1-1.414 0l-7-7A1 1 0 0 1 2 6.586V2z"/>
          <path d="M5.5 5.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zm0 2a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0z"/>
        </svg>
      );
    case "data-inicio":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16" className="me-2">
          <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
        </svg>
      );
    case "data-fim":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16" className="me-2">
          <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
          <path d="M8 6.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5z"/>
        </svg>
      );
    case "departamento":
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16" className="me-2">
          <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L8 2.207l6.646 6.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.707 1.5Z"/>
          <path d="m8 3.293 6 6V13.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 13.5V9.293l6-6Z"/>
        </svg>
      );
  }
}

export function FiltrosDashboard({ departamentos, filtros, onFiltrosChanged }: Props) {
  return (
    <div className="card border-0 shadow-sm mb-4">
      <div className="card-header bg-white border-bottom">
        <h5 className="mb-0 d-flex align-items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" className="me-2">
            <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5v-2z"/>
          </svg>
          Filtros de Analise
        </h5>
      </div>
      <div className="card-body">
        <div className="row g-3">
          <div className="col-12 col-md-3">
            <label className="form-label small mb-1 text-body-secondary d-flex align-items-center">
              <IconeFiltro tipo="tipo" />
              Tipo
            </label>
            <select
              className="form-select form-select-sm"
              value={filtros.tipo}
              onChange={(e) => onFiltrosChanged({ ...filtros, tipo: e.target.value as FiltrosType["tipo"] })}
            >
              <option value="">Todos os tipos</option>
              <option value="QUEBRA">Quebra</option>
              <option value="TRANSFERENCIA">Transferencia</option>
            </select>
          </div>
          <div className="col-12 col-md-3">
            <label className="form-label small mb-1 text-body-secondary d-flex align-items-center">
              <IconeFiltro tipo="data-inicio" />
              Data Inicio
            </label>
            <input
              type="date"
              className="form-control form-control-sm"
              value={filtros.dataInicio}
              onChange={(e) => onFiltrosChanged({ ...filtros, dataInicio: e.target.value })}
            />
          </div>
          <div className="col-12 col-md-3">
            <label className="form-label small mb-1 text-body-secondary d-flex align-items-center">
              <IconeFiltro tipo="data-fim" />
              Data Fim
            </label>
            <input
              type="date"
              className="form-control form-control-sm"
              value={filtros.dataFim}
              onChange={(e) => onFiltrosChanged({ ...filtros, dataFim: e.target.value })}
            />
          </div>
          <div className="col-12 col-md-3">
            <label className="form-label small mb-1 text-body-secondary d-flex align-items-center">
              <IconeFiltro tipo="departamento" />
              Departamento
            </label>
            <select
              className="form-select form-select-sm"
              value={filtros.departamentoId}
              onChange={(e) => onFiltrosChanged({ ...filtros, departamentoId: Number(e.target.value) })}
            >
              <option value={0}>Todos os departamentos</option>
              {departamentos.map((d) => (
                <option key={d.id} value={d.id}>{d.nome}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
