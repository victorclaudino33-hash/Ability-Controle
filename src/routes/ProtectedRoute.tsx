import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { podeAcessarModulo } from "@/config/permissions";
import type { Modulo } from "@/types/permissions";
import { FullscreenLoader } from "@/components/shared/FullscreenLoader";

interface ProtectedRouteProps {
  /** Módulo que esta rota representa. Se omitido, só exige autenticação (ex: Meu Perfil). */
  modulo?: Modulo;
  children: React.ReactNode;
}

export function ProtectedRoute({ modulo, children }: ProtectedRouteProps) {
  const { usuario, carregando } = useAuth();
  const location = useLocation();

  if (carregando) return <FullscreenLoader />;

  if (!usuario) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (modulo && !podeAcessarModulo(usuario.perfil, modulo)) {
    return <Navigate to="/acesso-negado" replace />;
  }

  return <>{children}</>;
}
