import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  UploadCloud,
  History,
  Building2,
  Briefcase,
  MapPin,
  UserCog,
  FileBarChart,
  Settings,
  UserCircle,
} from "lucide-react";
import type { Modulo } from "@/types/permissions";

export interface ItemMenu {
  modulo: Modulo;
  label: string;
  path: string;
  icon: LucideIcon;
}

/** Ordem e definição do menu lateral. O item só aparece se o perfil tiver permissão de "visualizar" no módulo. */
export const ITENS_MENU: ItemMenu[] = [
  { modulo: "dashboard", label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { modulo: "colaboradores", label: "Colaboradores", path: "/colaboradores", icon: Users },
  { modulo: "exames", label: "Exames", path: "/exames", icon: ClipboardList },
  { modulo: "importacao", label: "Importação", path: "/importacao", icon: UploadCloud },
  { modulo: "historico", label: "Histórico", path: "/historico", icon: History },
  { modulo: "clinicas", label: "Clínicas", path: "/clinicas", icon: Building2 },
  { modulo: "empresas", label: "Empresas", path: "/empresas", icon: Briefcase },
  { modulo: "bases", label: "Bases", path: "/bases", icon: MapPin },
  { modulo: "usuarios", label: "Usuários", path: "/usuarios", icon: UserCog },
  { modulo: "relatorios", label: "Relatórios", path: "/relatorios", icon: FileBarChart },
  { modulo: "configuracoes", label: "Configurações", path: "/configuracoes", icon: Settings },
];

export const ITEM_MEU_PERFIL: ItemMenu = {
  modulo: "meuPerfil",
  label: "Meu Perfil",
  path: "/meu-perfil",
  icon: UserCircle,
};
