import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, LogOut, ChevronDown, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { PERFIL_LABEL, PERFIL_BADGE_VARIANT } from "@/config/perfilLabels";
import { cn } from "@/lib/utils";

interface NavbarProps {
  onAbrirMenu: () => void;
  titulo: string;
}

function iniciais(nome: string | undefined | null) {
  if (!nome || !nome.trim()) return "U";
  const partes = nome.trim().split(/\s+/);
  const primeiras = partes.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "");
  return primeiras.join("") || "U";
}

export function Navbar({ onAbrirMenu, titulo }: NavbarProps) {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [menuAberto, setMenuAberto] = useState(false);

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b border-slate-200 bg-white px-4 lg:px-6">
      <button
        onClick={onAbrirMenu}
        className="text-slate-500 hover:text-slate-700 lg:hidden"
        aria-label="Abrir menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <h1 className="font-display text-lg font-semibold text-slate-800">{titulo}</h1>

      <div className="ml-auto flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            placeholder="Pesquisar..."
            className="h-9 w-56 rounded-[var(--radius-sm)] border border-slate-300 bg-slate-50 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ability-red/30 focus-visible:border-ability-red"
          />
        </div>

        <div className="relative">
          <button
            onClick={() => setMenuAberto((v) => !v)}
            className="flex items-center gap-2.5 rounded-[var(--radius-sm)] py-1 pl-1 pr-2 hover:bg-slate-100"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold text-white">
              {usuario ? iniciais(usuario.nome) : "?"}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-sm font-medium leading-tight text-slate-800">
                {usuario?.nome ?? "Usuário"}
              </p>
              {usuario && (
                <Badge variant={PERFIL_BADGE_VARIANT[usuario.perfil]} className="mt-0.5 py-0">
                  {PERFIL_LABEL[usuario.perfil]}
                </Badge>
              )}
            </div>
            <ChevronDown
              className={cn("h-4 w-4 text-slate-400 transition-transform", menuAberto && "rotate-180")}
            />
          </button>

          {menuAberto && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuAberto(false)} />
              <div className="absolute right-0 z-20 mt-2 w-48 rounded-[var(--radius-md)] border border-slate-200 bg-white py-1.5 shadow-lg">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
