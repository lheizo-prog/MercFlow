import type { Produto } from "../../../types/Produto";

interface TabelaProdutosProps {
  produtos: Produto[];
  onEditar: (produto: Produto) => void;
  onExcluir: (id: number) => void;
}

function TabelaProdutos({
  produtos,
  onEditar,
  onExcluir,
}: TabelaProdutosProps) {
  return (
    <table className="table table-striped mt-4">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nome</th>
          <th>Código</th>
          <th style={{ width: "180px" }}>Ações</th>
        </tr>
      </thead>

      <tbody>
        {produtos.length === 0 ? (
          <tr>
            <td colSpan={4} className="text-center text-muted">
              Nenhum produto cadastrado.
            </td>
          </tr>
        ) : (
          produtos.map((produto) => (
            <tr key={produto.id}>
              <td>{produto.id}</td>
              <td>{produto.nome}</td>
              <td>{produto.codigo}</td>

              <td>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-sm btn-warning"
                    onClick={() => onEditar(produto)}
                  >
                    Editar
                  </button>

                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => {
                      if (window.confirm(`Deseja excluir "${produto.nome}"?`)) {
                        onExcluir(produto.id!);
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

export default TabelaProdutos;
