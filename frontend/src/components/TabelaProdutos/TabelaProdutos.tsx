import type { Produto } from "../../types/Produto";

interface TabelaProdutosProps {
  produtos: Produto[];
}

function TabelaProdutos({ produtos }: TabelaProdutosProps) {
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
        {produtos.map((produto) => (
          <tr key={produto.id}>
            <td>{produto.id}</td>
            <td>{produto.nome}</td>
            <td>{produto.codigo}</td>
            <td>Excluir</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default TabelaProdutos;
