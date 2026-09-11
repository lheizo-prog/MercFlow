import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { useAuth } from "../hooks/useAuth";
import { Suspense, lazy } from "react";

const LoginPage = lazy(() => import("../pages/Login/LoginPage"));
const DashboardPage = lazy(() => import("../pages/Dashboard/DashboardPage"));
const DepartamentosPage = lazy(
  () => import("../pages/Departamentos/DepartamentosPage"),
);
const ProdutoGenericoPage = lazy(
  () => import("../pages/ProdutoGenerico/ProdutoGenericoPage"),
);
const ProdutoDepartamentoPage = lazy(
  () => import("../pages/ProdutoDepartamento/ProdutoDepartamentoPage"),
);
const ProdutoMerceariaPage = lazy(
  () => import("../pages/ProdutoMercearia/ProdutoMerceariaPage"),
);
const LancamentoPage = lazy(() => import("../pages/Lancamento/LancamentoPage"));
const UsuariosPage = lazy(() => import("../pages/Usuarios/UsuariosPage"));

function LoadingFallback() {
  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Carregando...</span>
      </div>
    </div>
  );
}

function ProtectedLayout() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <MainLayout />;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedLayout />}>
            
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route
              path="/produtos_genericos"
              element={<ProdutoGenericoPage />}
            />
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

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default AppRoutes;
