import AppRoutes from "./routes/AppRoutes";
import ErroAutorizacaoModal from "./components/common/ErroAutorizacaoModal";
import { AuthErrorProvider } from "./contexts/AuthErrorContext";

function App() {
  return (
    <AuthErrorProvider>
      <AppRoutes />
      <ErroAutorizacaoModal />
    </AuthErrorProvider>
  );
}

export default App;
