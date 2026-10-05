import type { Departamento } from "../../../types/Departamento";

interface TabelaDepartamentosProps {
  departamentos: Departamento[];
  onEditar: (departamento: Departamento) => void;
  onExcluir: (id: number) => void;
}

function TabelaDepartamentos({
  departamentos,
  onEditar,
  onExcluir,
}: TabelaDepartamentosProps) {
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
    <div className="row g-3">
      {departamentos.map((departamento) => (
        <div key={departamento.id} className="col-12 col-sm-6 col-lg-4">
          <div className="card border-0 shadow-sm h-100 transition-all" style={{ borderLeft: "4px solid var(--mf-primary) !important" }}>
            <div className="card-body d-flex flex-column p-3 p-sm-4">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="badge bg-light text-secondary border fw-medium" style={{ fontSize: "0.75rem" }}>
                  ID #{departamento.id}
                </span>
                <span className="p-1 rounded-circle bg-primary-subtle text-primary d-inline-flex">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </span>
              </div>
              <h5 className="card-title fw-bold text-dark mb-3" style={{ fontSize: "1.1rem" }}>
                {departamento.nome}
              </h5>
              <div className="mt-auto pt-2 border-top">
                <div className="d-flex gap-2">
                  <button
                    onClick={() => onEditar(departamento)}
                    className="btn btn-sm btn-outline-primary flex-grow-1 d-flex align-items-center justify-content-center gap-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          `Deseja excluir "${departamento.nome}"?`,
                        )
                      ) {
                        onExcluir(departamento.id!);
                      }
                    }}
                    className="btn btn-sm btn-outline-danger flex-grow-1 d-flex align-items-center justify-content-center gap-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Excluir</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default TabelaDepartamentos;
