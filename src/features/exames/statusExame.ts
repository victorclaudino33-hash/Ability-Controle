import type { StatusExame } from "@/types/exame";

export const STATUS_EXAME_LABEL: Record<StatusExame, string> = {
  pendente: "Pendente",
  concluido: "Concluído",
  cancelado: "Cancelado",
};

export const STATUS_EXAME_BADGE: Record<StatusExame, "warning" | "success" | "neutral"> = {
  pendente: "warning",
  concluido: "success",
  cancelado: "neutral",
};
