import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import DashboardPage from "../pages/Dashboard/DashboardPage";
import MainLayout from "../layouts/MainLayout";
import LoginPage from "../pages/Login/LoginPage";

import DepartamentosPage from "../pages/Departamentos/DepartamentosPage";
import ProdutoGenericoPage from "../pages/ProdutoGenerico/ProdutoGenericoPage";
import ProdutoDepartamentoPage from "../pages/ProdutoDepartamento/ProdutoDepartamentoPage";
import ProdutoMerceariaPage from "../pages/ProdutoMercearia/ProdutoMerceariaPage";
import LancamentoPage from "../pages/Lancamento/LancamentoPage";
import UsuariosPage from "../pages/Usuarios/UsuariosPage";

function ProtectedLayout() {
  const token = localStorage.getItem("mercflow_token");
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <MainLayout />;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/produtos_genericos" element={<ProdutoGenericoPage />} />
          <Route path="/departamentos" element={<DepartamentosPage />} />
          <Route
            path="/produtos_departamento"
            element={<ProdutoDepartamentoPage />}
          />
          <Route
            path="/produtos_mercearia"
            element={<ProdutoMerceariaPage />}
          />
          <Route path="/usuarios" element={<UsuariosPage />} />
          <Route path="/lancamentos" element={<LancamentoPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
