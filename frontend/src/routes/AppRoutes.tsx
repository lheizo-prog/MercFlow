import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardPage from "../pages/Dashboard/DashboardPage";
import MainLayout from "../layouts/MainLayout";

import DepartamentosPage from "../pages/Departamentos/DepartamentosPage";
import ProdutoGenericoPage from "../pages/ProdutoGenerico/ProdutoGenericoPage";
import ProdutoDepartamentoPage from "../pages/ProdutoDepartamento/ProdutoDepartamentoPage";
import ProdutoMerceariaPage from "../pages/ProdutoMercearia/ProdutoMerceariaPage";
import LancamentoPage from "../pages/Lancamento/LancamentoPage";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/produtos_genericos" element={<ProdutoGenericoPage />} />
          <Route path="/departamentos" element={<DepartamentosPage />} />
          <Route
            path="produtos_departamento"
            element={<ProdutoDepartamentoPage />}
          />
          <Route path="produtos_mercearia" element={<ProdutoMerceariaPage />} />
          <Route path="lancamentos" element={<LancamentoPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
