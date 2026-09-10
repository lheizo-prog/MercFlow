import { createContext, useCallback, useEffect, useState, type ReactNode } from "react";
import DOMPurify from "dompurify";

interface AuthErrorContextType {
  erro: string | null;
  fechar: () => void;
}

const AuthErrorContext = createContext<AuthErrorContextType | undefined>(undefined);

export function AuthErrorProvider({ children }: { children: ReactNode }) {
  const [erro, setErro] = useState<string | null>(null);

  const fechar = useCallback(() => {
    setErro(null);
  }, []);

  useEffect(() => {
    function handleAuthError(event: Event) {
      const customEvent = event as CustomEvent<{ mensagem: string }>;
      // Sanitizar mensagem para prevenir XSS
      const sanitizedMensagem = DOMPurify.sanitize(customEvent.detail.mensagem);
      setErro(sanitizedMensagem);
    }
    window.addEventListener("auth-error", handleAuthError);
    return () => window.removeEventListener("auth-error", handleAuthError);
  }, []);

  return (
    <AuthErrorContext.Provider value={{ erro, fechar }}>
      {children}
    </AuthErrorContext.Provider>
  );
}

export { AuthErrorContext };
export type { AuthErrorContextType };
