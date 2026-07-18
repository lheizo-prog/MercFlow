import type { Produto } from "../../types/Produto";

interface TabelaProdutosProps {
  produtos: Produto[];
  onEditar: (produto: Produto) => void;
  onExcluir: (produto: Produto) => void;
}

function TabelaProdutos({
  produtos,
  onEditar,
  onExcluir,
}: TabelaProdutosProps) {
  return (
    <table className="table table-stripe mt-4">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nome</th>
          <th>Código</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        {produtos.length === 0 ? (
          <tr>
            <td colSpan={4} className="text-center">
              Nenhum produto encontrado.
            </td>
          </tr>
        ) : (
          produtos.map((produto) => (
            <tr key={produto.id}>
              <td>{produto.id}</td>
              <td>{produto.nome}</td>
              <td>{produto.codigo}</td>
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
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

export default TabelaProdutos;
