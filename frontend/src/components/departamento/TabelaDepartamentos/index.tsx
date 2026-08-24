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
  return (
    <div className="table-responsive bg-white rounded shadow-sm">
      <table className="table table-hover align-middle mb-0">
        <thead className="table-light">
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th style={{ width: "180px" }}>Ações</th>
          </tr>
        </thead>

        <tbody>
          {departamentos.length === 0 ? (
            <tr>
              <td colSpan={3} className="text-center text-body-secondary py-4">
                Nenhum departamento cadastrado.
              </td>
            </tr>
          ) : (
            departamentos.map((departamento) => (
              <tr key={departamento.id}>
                <td>{departamento.id}</td>
                <td>{departamento.nome}</td>

                <td>
                  <div className="d-flex gap-2 text-nowrap">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => onEditar(departamento)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => {
                        if (
                          window.confirm(
                            `Deseja excluir "${departamento.nome}"?`,
                          )
                        ) {
                          onExcluir(departamento.id!);
                        }
                      }}
                    >
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default TabelaDepartamentos;
