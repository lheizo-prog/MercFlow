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
    <table className="table table-striped mt-4">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nome</th>
          <th style={{ width: "180px" }}>Ações</th>
        </tr>
      </thead>

      <tbody>
        {departamentos.length === 0 ? (
          <tr>
            <td colSpan={4} className="text-center text-muted">
              Nenhum produto cadastrado.
            </td>
          </tr>
        ) : (
          departamentos.map((departamento) => (
            <tr key={departamento.id}>
              <td>{departamento.id}</td>
              <td>{departamento.nome}</td>

              <td>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-sm btn-warning"
                    onClick={() => onEditar(departamento)}
                  >
                    Editar
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => {
                      if (
                        window.confirm(`Deseja excluir "${departamento.nome}"?`)
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
  );
}

export default TabelaDepartamentos;
