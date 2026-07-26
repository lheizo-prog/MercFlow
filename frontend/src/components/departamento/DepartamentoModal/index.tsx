import type { Departamento } from "../../../types/Departamento";
import DepartamentoForm from "../DepartamentoForm/index";

interface DepartamentoModalProps {
  aberto: boolean;
  departamento?: Departamento;
  onFechar: () => void;
  onSalvar: (departamento: Departamento) => Promise<void>;
}

function DepartamentoModal({
  aberto,
  departamento,
  onFechar,
  onSalvar,
}: DepartamentoModalProps) {
  if (!aberto) {
    return null;
  }
  async function salvarDepartamento(departamento: Departamento) {
    await onSalvar(departamento);
    onFechar();
  }
  return (
    <>
      <div className="modal-backdrop fade show" onClick={onFechar}></div>
      <div className="modal d-block" tabIndex={-1}>
        <div className="modal-dialog" onClick={(e) => e.stopPropagation}>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {departamento ? "Editar Deparamento" : "Novo Departamentos"}
              </h5>
              <button type="button" className="btn-close" onClick={onFechar} />
            </div>
            <div className="modal-body">
              <DepartamentoForm
                departamento={departamento}
                onSalvar={salvarDepartamento}
              />
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onFechar}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default DepartamentoModal;
