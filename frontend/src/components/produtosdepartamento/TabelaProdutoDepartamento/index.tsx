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
      <div className="alert alert-info">
        Nenhum produto de departamento encontrado.
      </div>
    );
  }
  return (
    <table className="table table-striped table-hover align-middle">
      <thead>
        <tr>
          <th>ID</th>
          <th>Produto Genérico</th>
          <th>Departamento</th>
          <th>Nome</th>
          <th>Código</th>
          <th>Unidade</th>
          <th>Conversão</th>
          <th style={{ width: "170px" }}>Ações</th>
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
        ))}
      </tbody>
    </table>
  );
}

export default TabelaProdutosDepartamento;
