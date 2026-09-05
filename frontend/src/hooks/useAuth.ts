import { useCallback, useMemo } from "react";

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
  const user = useMemo((): AuthUser | null => {
    try {
      const stored = localStorage.getItem("mercflow_usuario");
      if (!stored) return null;
      return JSON.parse(stored) as AuthUser;
    } catch {
      return null;
    }
  }, []);

  const isAuthenticated = useMemo(() => {
    return localStorage.getItem("mercflow_token") !== null;
  }, []);

  const isAdmin = useMemo(
    () => user?.perfil === "admin" || user?.perfil === "super_admin",
    [user?.perfil],
  );

  const isSuperAdmin = useMemo(() => user?.perfil === "super_admin", [user?.perfil]);

  const isOperador = useMemo(() => user?.perfil === "operador", [user?.perfil]);

  const isVisualizador = useMemo(
    () => user?.perfil === "visualizador",
    [user?.perfil],
  );

  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!user?.permissoes) return false;
      return user.permissoes.includes(permission);
    },
    [user?.permissoes],
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
