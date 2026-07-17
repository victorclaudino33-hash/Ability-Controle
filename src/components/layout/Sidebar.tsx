import { NavLink } from "react-router-dom";
import { Activity, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { podeAcessarModulo } from "@/config/permissions";
import { ITENS_MENU, ITEM_MEU_PERFIL } from "@/config/menu";

interface SidebarProps {
  aberta: boolean;
  onFechar: () => void;
}

export function Sidebar({ aberta, onFechar }: SidebarProps) {
  const { usuario } = useAuth();
  const perfil = usuario?.perfil;

  const itensPermitidos = perfil
    ? ITENS_MENU.filter((item) => podeAcessarModulo(perfil, item.modulo))
    : [];

  return (
    <>
      {/* Overlay mobile */}
      {aberta && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
          onClick={onFechar}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform lg:static lg:translate-x-0",
          aberta ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] bg-ability-red">
              <Activity className="h-4.5 w-4.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-display text-sm font-bold leading-tight text-slate-800">
              Ability<br />
              <span className="font-normal text-slate-500">Health Control</span>
            </span>
          </div>
          <button
            onClick={onFechar}
            className="text-slate-400 hover:text-slate-600 lg:hidden"
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="scrollbar-thin flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {itensPermitidos.map((item) => (
            <NavLink
              key={item.modulo}
              to={item.path}
              onClick={onFechar}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-ability-red-light text-ability-red"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                )
              }
            >
              <item.icon className="h-4.5 w-4.5 shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-200 p-3">
          <NavLink
            to={ITEM_MEU_PERFIL.path}
            onClick={onFechar}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-ability-red-light text-ability-red"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
              )
            }
          >
            <ITEM_MEU_PERFIL.icon className="h-4.5 w-4.5 shrink-0" />
            {ITEM_MEU_PERFIL.label}
          </NavLink>
        </div>
      </aside>
    </>
  );
}
