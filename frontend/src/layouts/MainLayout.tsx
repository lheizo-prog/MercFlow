import "../components/Navbar/Navbar";
import Navbar from "../components/Navbar/Navbar";
import Sidebar from "../components/SIdebar/Sidebar";
import { useState } from "react";

function MainLayout() {
  const [contador, setContador] = useState(0);
  return (
    <>
      <Navbar titulo="MercFlow Beta" />
      <Sidebar usuario="Leonardo" />
      <h1>Bem-vindo ao MercFlow</h1>
      <p>{contador}</p>
      <button onClick={() => setContador(contador + 1)}> + </button>
      <button onClick={() => setContador(contador - 1)}> - </button>
    </>
  );
}

export default MainLayout;
