import { useState } from "react";
import type { Produto } from "../../types/Produto";
import TabelaProdutos from "../../components/TabelaProdutos/TabelaProdutos";

function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([
    {
      id: 1,
      nome: "Arroz",
      codigo: "12345",
    },
    {
      id: 2,
      nome: "Feijão",
      codigo: "12346",
    },
    {
      id: 3,
      nome: "Leite",
      codigo: "12347",
    },
  ]);
  return (
    <>
      <div className="container">
        <h1>Produtos</h1>
        <button className="btn btn-primary">Novo Produto</button>
        <div className="mt-4">
          <label className="form-label">Pesquisar Produto</label>
          <input
            type="text"
            className="form-control"
            placeholder="Digite ID, nome ou código..."
          />
        </div>
        <TabelaProdutos produtos={produtos} />
      </div>
    </>
  );
}

export default ProdutosPage;
