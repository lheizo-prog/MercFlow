import { useContext } from "react";
import { AuthErrorContext } from "../contexts/AuthErrorContext";
import type { AuthErrorContextType } from "../contexts/AuthErrorContext";

export function useAuthError(): AuthErrorContextType {
  const context = useContext(AuthErrorContext);
  if (!context) {
    throw new Error(
      "useAuthError deve ser usado dentro de um AuthErrorProvider",
    );
  }
  return context;
}
