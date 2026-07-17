import type { AcaoHistorico, EntidadeHistorico } from "@/types/historico";

export const ACAO_LABEL: Record<AcaoHistorico, string> = {
  criacao: "Criação",
  edicao: "Edição",
  exclusao: "Exclusão",
};

export const ACAO_BADGE: Record<AcaoHistorico, "success" | "info" | "danger"> = {
  criacao: "success",
  edicao: "info",
  exclusao: "danger",
};

export const ENTIDADE_LABEL: Record<EntidadeHistorico, string> = {
  exame: "Exame",
  colaborador: "Colaborador",
  empresa: "Empresa",
  base: "Base",
  clinica: "Clínica",
  usuario: "Usuário",
  tipoExame: "Tipo de exame",
};
