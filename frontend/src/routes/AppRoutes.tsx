import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardPage from "../pages/Dashboard/DashboardPage";
import ProdutosGenericosPage from "../pages/ProdutosGenericos/ProdutosGenericosPage";
import MainLayout from "../layouts/MainLayout";
import DepartamentosPage from "../pages/Departamentos/DepartamentosPage";
import ProdutoDepartamentoPage from "../pages/ProdutoDepartamento/ProdutoDepartamentoPage";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route
            path="/produtos_genericos"
            element={<ProdutosGenericosPage />}
          />
          <Route path="/departamentos" element={<DepartamentosPage />} />
          <Route
            path="produtos_departamento"
            element={<ProdutoDepartamentoPage />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
