import type { ProdutoGenerico } from "../../../types/ProdutoGenerico";

interface TabelaProdutosProps {
  produtos: ProdutoGenerico[];
  onEditar: (produto: ProdutoGenerico) => void;
  onExcluir: (id: number) => void;
}

function TabelaProdutos({
  produtos,
  onEditar,
  onExcluir,
}: TabelaProdutosProps) {
  return (
    <div className="table-responsive bg-white rounded shadow-sm">
      <table className="table table-hover align-middle mb-0">
        <thead className="table-light">
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
              <td colSpan={4} className="text-center text-body-secondary py-4">
                Nenhum produto genérico cadastrado.
              </td>
            </tr>
          ) : (
            produtos.map((produto) => (
              <tr key={produto.id}>
                <td>{produto.id}</td>
                <td>{produto.nome}</td>
                <td>{produto.codigo}</td>

                <td>
                  <div className="d-flex gap-2 text-nowrap">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => onEditar(produto)}
                    >
                      Editar
                    </button>

                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => {
                        if (
                          window.confirm(`Deseja excluir "${produto.nome}"?`)
                        ) {
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
    </div>
  );
}

export default TabelaProdutos;
