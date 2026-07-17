import type { Perfil } from "@/types/auth";

export const PERFIL_LABEL: Record<Perfil, string> = {
  administrador: "Administrador",
  supervisor: "Supervisor",
  operador: "Operador",
  consulta: "Consulta",
};

export const PERFIL_BADGE_VARIANT: Record<Perfil, "danger" | "info" | "success" | "neutral"> = {
  administrador: "danger",
  supervisor: "info",
  operador: "success",
  consulta: "neutral",
};
