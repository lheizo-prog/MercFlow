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
export function FiltrosDashboard({ departamentos, filtros, onFiltrosChanged }: Props) {
  return (
    <div className="card border-0 shadow-sm mb-4">
      <div className="card-header bg-white"><h5 className="mb-0">📊 Filtros de Análise</h5></div>
      <div className="card-body">
        <div className="row g-3">
          <div className="col-12 col-md-3">
            <label className="form-label small mb-1 text-body-secondary">Tipo</label>
            <select className="form-select form-select-sm" value={filtros.tipo} onChange={(e) => onFiltrosChanged({ ...filtros, tipo: e.target.value as FiltrosType["tipo"] })}>
              <option value="">Todos os tipos</option>
              <option value="QUEBRA">Quebra</option>
              <option value="TRANSFERENCIA">Transferência</option>
            </select>
          </div>
          <div className="col-12 col-md-3">
            <label className="form-label small mb-1 text-body-secondary">Data Início</label>
            <input type="date" className="form-control form-control-sm" value={filtros.dataInicio} onChange={(e) => onFiltrosChanged({ ...filtros, dataInicio: e.target.value })} />
          </div>
          <div className="col-12 col-md-3">
            <label className="form-label small mb-1 text-body-secondary">Data Fim</label>
            <input type="date" className="form-control form-control-sm" value={filtros.dataFim} onChange={(e) => onFiltrosChanged({ ...filtros, dataFim: e.target.value })} />
          </div>
          <div className="col-12 col-md-3">
            <label className="form-label small mb-1 text-body-secondary">Departamento</label>
            <select className="form-select form-select-sm" value={filtros.departamentoId} onChange={(e) => onFiltrosChanged({ ...filtros, departamentoId: Number(e.target.value) })}>
              <option value={0}>Todos os departamentos</option>
              {departamentos.map((d) => <option key={d.id} value={d.id}>{d.nome}</option>)}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
