export type AcaoHistorico = "criacao" | "edicao" | "exclusao";
export type EntidadeHistorico = "exame" | "colaborador" | "empresa" | "base" | "clinica" | "usuario" | "tipoExame";

/** Documento salvo em Firestore: coleção "historico" */
export interface RegistroHistorico {
  id: string;
  entidade: EntidadeHistorico;
  entidadeId: string;
  acao: AcaoHistorico;
  descricao: string;
  colaboradorId?: string; // quando aplicável (ex: exame vinculado a um colaborador)
  usuarioUid: string;
  usuarioNome: string;
  criadoEm: string;
}

export type RegistroHistoricoInput = Omit<RegistroHistorico, "id" | "criadoEm">;
