import { useCallback, useEffect, useState } from "react";

export interface AuthUser {
  username: string;
  nome: string;
  loja_id: number;
  loja_nome: string;
  perfil: string;
  permissoes?: string[];
}

export interface UseAuthReturn {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isOperador: boolean;
  isVisualizador: boolean;
  hasPermission: (permission: string) => boolean;
  logout: () => void;
}

export function useAuth(): UseAuthReturn {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("mercflow_token"),
  );
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem("mercflow_usuario");
    if (stored) {
      try {
        return JSON.parse(stored) as AuthUser;
      } catch {
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    const handleStorage = () => {
      const newToken = localStorage.getItem("mercflow_token");
      const newUser = localStorage.getItem("mercflow_usuario");

      setToken(newToken);

      if (newUser) {
        try {
          setUser(JSON.parse(newUser) as AuthUser);
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const isAuthenticated = token !== null;

  const isAdmin = user?.perfil === "admin" || user?.perfil === "super_admin";

  const isSuperAdmin = user?.perfil === "super_admin";

  const isOperador = user?.perfil === "operador";

  const isVisualizador = user?.perfil === "visualizador";

  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!user?.permissoes) return false;
      return user.permissoes.includes(permission);
    },
    [user],
  );

  const logout = useCallback(() => {
    localStorage.removeItem("mercflow_token");
    localStorage.removeItem("mercflow_usuario");
    localStorage.removeItem("mercflow_loja_id");
    window.location.href = "/login";
  }, []);

  return {
    user,
    isAuthenticated,
    isAdmin,
    isSuperAdmin,
    isOperador,
    isVisualizador,
    hasPermission,
    logout,
  };
}
