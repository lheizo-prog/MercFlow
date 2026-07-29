import type { ProdutoDepartamento } from "../../../types/ProdutoDepartamento";

interface Props {
  produtos: ProdutoDepartamento[];
  onEditar: (produto: ProdutoDepartamento) => void;
  onExcluir: (id: number) => void;
}

function TabelaProdutosDepartamento({ produtos, onEditar, onExcluir }: Props) {
  return (
    <table className="tabela table-striped table-hover align-middle">
      <thead>
        <tr>
          <th>ID</th>
          <th>Produto Base</th>
          <th>Departamento</th>
          <th>Nome</th>
          <th>Código</th>
          <th>Unidade</th>
          <th>Fator</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        {produtos.length === 0 ? (
          <tr>
            <td colSpan={8} className="text-center">
              Nenhum produto encontrado.
            </td>
          </tr>
        ) : (
          produtos.map((produto) => (
            <tr key={produto.id}>
              <td>{produto.id}</td>

              <td>
                {produto.produto_base_nome ?? `#${produto.produto_base_id}`}
              </td>

              <td>
                {produto.departamento_nome ?? `#${produto.departamento_id}`}
              </td>

              <td>{produto.nome}</td>

              <td>{produto.codigo}</td>

              <td>{produto.unidade}</td>

              <td>{produto.fator_conversao}</td>

              <td>
                <button
                  className="btn btn-warning btn-sm me-2"
                  onClick={() => onEditar(produto)}
                >
                  Editar
                </button>

                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => onExcluir(produto.id!)}
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

export default TabelaProdutosDepartamento;
