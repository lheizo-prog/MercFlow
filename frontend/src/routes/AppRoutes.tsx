import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardPage from "../pages/Dashboard/DashboardPage";
import ProdutosPage from "../pages/Produtos/ProdutosPage";
import MainLayout from "../layouts/MainLayout";
import SetoresPage from "../pages/Setores/SetoresPage";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/produtos" element={<ProdutosPage />} />
          <Route path="/setores" element={<SetoresPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
