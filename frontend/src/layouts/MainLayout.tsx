import "../components/Navbar/Navbar";
import Navbar from "../components/Navbar/Navbar";
import Sidebar from "../components/Sidebar/Sidebar";
import { useState } from "react";
import ProdutosPage from "../pages/Produtos/ProdutosPage";

function MainLayout() {
  const [produtos, setProdutos] = useState([
    {
      id: 1,
      nome: "Arroz",
    },
    {
      id: 2,
      nome: "Feijão",
    },
  ]);
  return (
    <>
      <Navbar titulo="MercFlow Beta" />
      <Sidebar usuario="Leonardo" />
      <h1>Bem-vindo ao MercFlow</h1>
      <p>
        {produtos.map((produto) => (
          <li key={produto.id}>{produto.nome}</li>
        ))}
      </p>
      <button
        onClick={() =>
          setProdutos([
            ...produtos,
            {
              id: 3,
              nome: "Macarrão",
            },
          ])
        }
      >
        Clique para adicionar
      </button>
      <ProdutosPage />;
    </>
  );
}

export default MainLayout;
