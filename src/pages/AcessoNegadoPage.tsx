import { useNavigate } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AcessoNegadoPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-danger-light">
        <ShieldAlert className="h-8 w-8 text-danger" />
      </div>
      <p className="mt-6 font-display text-sm font-semibold uppercase tracking-wide text-danger">
        Erro 403
      </p>
      <h1 className="mt-2 font-display text-2xl font-bold text-slate-800">Acesso negado</h1>
      <p className="mt-2 max-w-sm text-sm text-slate-500">
        Seu perfil não tem permissão para acessar esta área do sistema. Se
        você acredita que isso é um engano, contate o administrador.
      </p>
      <div className="mt-6 flex gap-3">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Voltar
        </Button>
        <Button onClick={() => navigate("/dashboard")}>Ir para o Dashboard</Button>
      </div>
    </div>
  );
}
