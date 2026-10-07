import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { useAuth } from "../hooks/useAuth";
import { Suspense, lazy, type ComponentType } from "react";

// Função para retry automático em dynamic imports quando há novo deploy na Vercel
function lazyWithRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
) {
  return lazy(() =>
    factory().catch((error) => {
      // Se falhou ao buscar o chunk dinâmico (comum após deploy com novo hash),
      // recarrega a página uma vez para puxar os novos scripts sem travar o usuário.
      const hasReloaded = sessionStorage.getItem("chunk_reload_retry");
      if (!hasReloaded) {
        sessionStorage.setItem("chunk_reload_retry", "true");
        window.location.reload();
        return new Promise<{ default: T }>(() => {});
      }
      sessionStorage.removeItem("chunk_reload_retry");
      throw error;
    }),
  );
}

const LoginPage = lazyWithRetry(() => import("../pages/Login/LoginPage"));
const DashboardPage = lazyWithRetry(() => import("../pages/Dashboard/DashboardPage"));
const DepartamentosPage = lazyWithRetry(
  () => import("../pages/Departamentos/DepartamentosPage"),
);
const ProdutoGenericoPage = lazyWithRetry(
  () => import("../pages/ProdutoGenerico/ProdutoGenericoPage"),
);
const ProdutoDepartamentoPage = lazyWithRetry(
  () => import("../pages/ProdutoDepartamento/ProdutoDepartamentoPage"),
);
const ProdutoMerceariaPage = lazyWithRetry(
  () => import("../pages/ProdutoMercearia/ProdutoMerceariaPage"),
);
const LancamentoPage = lazyWithRetry(() => import("../pages/Lancamento/LancamentoPage"));
const UsuariosPage = lazyWithRetry(() => import("../pages/Usuarios/UsuariosPage"));

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
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default AppRoutes;
