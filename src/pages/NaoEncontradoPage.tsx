import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function NaoEncontradoPage() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">
      <p className="font-display text-6xl font-bold text-slate-200">404</p>
      <h1 className="mt-2 font-display text-xl font-bold text-slate-800">Página não encontrada</h1>
      <p className="mt-2 text-sm text-slate-500">O endereço acessado não existe.</p>
      <Button className="mt-6" onClick={() => navigate("/dashboard")}>Ir para o Dashboard</Button>
    </div>
  );
}
