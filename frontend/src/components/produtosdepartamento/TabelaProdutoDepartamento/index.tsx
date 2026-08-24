import type { ProdutoDepartamento } from "../../../types/ProdutoDepartamento";

interface TabelaProdutosDepartamentoProps {
  produtos: ProdutoDepartamento[];
  onEditar: (produto: ProdutoDepartamento) => void;
  onExcluir: (id: number) => void;
}

function TabelaProdutosDepartamento({
  produtos,
  onEditar,
  onExcluir,
}: TabelaProdutosDepartamentoProps) {
  if (produtos.length === 0) {
    return (
      <div className="alert alert-light border text-body-secondary">
        Nenhum produto de departamento encontrado.
      </div>
    );
  }
  return (
    <div className="table-responsive bg-white rounded shadow-sm">
      <table className="table table-hover align-middle mb-0">
        <thead className="table-light">
          <tr>
            <th>ID</th>
            <th>Produto Genérico</th>
            <th>Departamento</th>
            <th>Nome</th>
            <th>Código</th>
            <th>Unidade</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {produtos.map((produto) => (
            <tr key={produto.id}>
              <td>{produto.id}</td>
              <td>{produto.produto_generico_nome}</td>
              <td>{produto.departamento_nome}</td>
              <td>{produto.nome}</td>
              <td>{produto.codigo}</td>
              <td>{String(produto.unidade_medida)}</td>
              <td>
                <div className="d-flex gap-2 text-nowrap">
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => onEditar(produto)}
                  >
                    Editar
                  </button>

                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => onExcluir(produto.id!)}
                  >
                    Excluir
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TabelaProdutosDepartamento;
