import type { Departamento } from "../../../types/Departamento";

interface TabelaDepartamentosProps {
  departamentos: Departamento[];
  onEditar: (departamento: Departamento) => void;
  onExcluir: (id: number) => void;
}

function TabelaDepartamentos({ departamentos, onEditar, onExcluir }: TabelaDepartamentosProps) {
  if (departamentos.length === 0) {
    return (
      <div className="table-responsive bg-white rounded shadow-sm">
        <div className="text-center text-body-secondary py-4">
          Nenhum departamento cadastrado.
        </div>
      </div>
    );
  }

  return (
    <div className="table-responsive bg-white rounded shadow-sm">
      <div className="row g-3">
        {departamentos.map((departamento) => (
          <div key={departamento.id} className="col-12 col-sm-6 col-md-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body d-flex flex-column">
                <h6 className="card-subtitle mb-2 text-body-secondary">ID: {departamento.id}</h6>
                <h5 className="card-title mb-3">{departamento.nome}</h5>
                <div className="mt-auto">
                  <div className="d-flex gap-2">
                    <button onClick={() => onEditar(departamento)} className="btn btn-sm btn-outline-primary flex-grow-1">
                      Editar
                    </button>
                    <button onClick={() => {
                      if (window.confirm(`Deseja excluir "${departamento.nome}"?`)) {
                        onExcluir(departamento.id!);
                      }
                    }} className="btn btn-sm btn-outline-danger flex-grow-1">
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TabelaDepartamentos;
