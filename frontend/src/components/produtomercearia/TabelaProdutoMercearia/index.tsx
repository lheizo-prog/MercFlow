import type { ProdutoMercearia } from "../../../types/ProdutoMercearia";

interface TabelaProdutoMerceariaProps {
  produtos: ProdutoMercearia[];
  onEditar: (produto: ProdutoMercearia) => void;
  onExcluir: (id: number) => void;
}

function TabelaProdutoMercearia({
  produtos,
  onEditar,
  onExcluir,
}: TabelaProdutoMerceariaProps) {
  if (produtos.length === 0) {
    return (
      <div className="alert alert-secondary">Nenhum produto encontrado. </div>
    );
  }

  return (
    <div className="table-responsive">
      {" "}
      <table className="table table-striped table-hover align-middle">
        {" "}
        <thead>
          {" "}
          <tr>
            {" "}
            <th>Produto Base</th> <th>SKU</th> <th>Marca</th> <th>Descrição</th>{" "}
            <th>Código de Barras</th> <th>Embalagem</th>{" "}
            <th className="text-end">Ações</th>{" "}
          </tr>{" "}
        </thead>
        <tbody>
          {produtos.map((produto) => (
            <tr key={produto.id}>
              <td>{produto.produto_generico_nome}</td>

              <td>
                <strong>{produto.sku}</strong>
              </td>

              <td>{produto.marca}</td>

              <td>{produto.descricao}</td>

              <td>{produto.codigo_barras}</td>

              <td>
                {produto.quantidade_embalagem} {produto.unidade_medida}
              </td>

              <td className="text-end">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary me-2"
                  onClick={() => onEditar(produto)}
                >
                  Editar
                </button>

                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => {
                    if (produto.id !== undefined) {
                      onExcluir(produto.id);
                    }
                  }}
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TabelaProdutoMercearia;
