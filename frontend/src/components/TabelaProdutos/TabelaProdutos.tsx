import type { Produto } from "../../types/Produto";

interface TabelaProdutosProps {
  produtos: Produto[];
  onEditar: (produto: Produto) => void;
<<<<<<< HEAD
  onExcluir: (produto: Produto) => void;
=======
  onExcluir: (id: number) => void;
>>>>>>> consertando-novos-endpoints-para-interface
}

function TabelaProdutos({
  produtos,
  onEditar,
  onExcluir,
}: TabelaProdutosProps) {
<<<<<<< HEAD
=======
  {
    produtos.map((produto) => {
      console.log(produto);
    });
  }
>>>>>>> consertando-novos-endpoints-para-interface
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
<<<<<<< HEAD
            <td colSpan={4} className="text-center">
              Nenhum produto encontrado.
=======
            <td colSpan={4} className="text-center text-muted">
              Nenhum produto cadastrado.
>>>>>>> consertando-novos-endpoints-para-interface
            </td>
          </tr>
        ) : (
          produtos.map((produto) => (
            <tr key={produto.id}>
              <td>{produto.id}</td>
              <td>{produto.nome}</td>
              <td>{produto.codigo}</td>
<<<<<<< HEAD
              <td>
                <button
                  className="btn btn-warning btn-sm me-2"
                  onClick={() => onEditar(produto)}
                >
                  Editar
                </button>
              </td>
              <td>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => onExcluir(produto)}
                >
                  Excluir
                </button>
=======

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
                      console.log("ID Clicado: ", produto.id);
                      if (window.confirm(`Deseja excluir "${produto.nome}"?`)) {
                        onExcluir(produto.id!);
                      }
                    }}
                  >
                    Excluir
                  </button>
                </div>
>>>>>>> consertando-novos-endpoints-para-interface
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

export default TabelaProdutos;
