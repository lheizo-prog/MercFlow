import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardPage from "../pages/Dashboard/DashboardPage";
import ProdutosPage from "../pages/Produtos/ProdutosPage";
import MainLayout from "../layouts/MainLayout";
import DepartamentosPage from "../pages/Departamentos/DepartamentosPage";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/produtos" element={<ProdutosPage />} />
          <Route path="/departamentos" element={<DepartamentosPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
