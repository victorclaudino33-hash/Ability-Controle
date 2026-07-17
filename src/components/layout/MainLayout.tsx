import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { ITENS_MENU, ITEM_MEU_PERFIL } from "@/config/menu";

function tituloDaRota(pathname: string): string {
  const item = [...ITENS_MENU, ITEM_MEU_PERFIL].find((i) => pathname.startsWith(i.path));
  return item?.label ?? "Ability Health Control";
}

export function MainLayout() {
  const [menuAberto, setMenuAberto] = useState(false);
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar aberta={menuAberto} onFechar={() => setMenuAberto(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar onAbrirMenu={() => setMenuAberto(true)} titulo={tituloDaRota(location.pathname)} />
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
