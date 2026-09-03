import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

interface AuthErrorContextType {
  erro: string | null;
  mostrarErro: (mensagem: string) => void;
  fechar: () => void;
}

const AuthErrorContext = createContext<AuthErrorContextType | undefined>(undefined);

export function AuthErrorProvider({ children }: { children: ReactNode }) {
  const [erro, setErro] = useState<string | null>(null);

  const mostrarErro = useCallback((mensagem: string) => {
    setErro(mensagem);
  }, []);

  const fechar = useCallback(() => {
    setErro(null);
  }, []);

  useEffect(() => {
    function handleAuthError(event: Event) {
      const customEvent = event as CustomEvent<{ mensagem: string }>;
      setErro(customEvent.detail.mensagem);
    }
    window.addEventListener("auth-error", handleAuthError);
    return () => {
      window.removeEventListener("auth-error", handleAuthError);
    };
  }, []);

  return (
    <AuthErrorContext.Provider value={{ erro, mostrarErro, fechar }}>
      {children}
    </AuthErrorContext.Provider>
  );
}

export function useAuthError(): AuthErrorContextType {
  const context = useContext(AuthErrorContext);
  if (!context) {
    throw new Error("useAuthError deve ser usado dentro de um AuthErrorProvider");
  }
  return context;
}
