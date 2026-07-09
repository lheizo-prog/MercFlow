import type { Produto } from "../../types/Produto";

function ProdutosPage() {
  return (
    <>
      <div className="container">
        <h1>Produtos</h1>
        <button className="d-flex justify-content-between align-items-center">
          Novo Produto
        </button>
        <div className="mt-4">
          <label className="form-label">Pesquisar Produto</label>
          <input
            type="text"
            className="form-control"
            placeholder="Digite ID, nome ou código..."
          />
        </div>
        <table className="table table-striped mt-4">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Código</th>
              <th>Ações</th>
            </tr>
          </thead>
        </table>
      </div>
    </>
  );
}

export default ProdutosPage;
