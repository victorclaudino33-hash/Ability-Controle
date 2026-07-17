export type StatusExame = "pendente" | "concluido" | "cancelado";

/** Informações do ASO — nunca armazenamos o arquivo em si, só a referência (conforme especificação) */
export interface InfoASO {
  nomeArquivo: string;
  numeroDocumento: string;
  linkExterno?: string;
  observacao?: string;
}

/** Documento salvo em Firestore: coleção "exames" */
export interface Exame {
  id: string;
  colaboradorId: string;
  colaboradorNome: string; // denormalizado
  colaboradorCpf: string; // denormalizado (ajuda na pesquisa/exibição)
  tipoId: string;
  tipoNome: string; // denormalizado
  clinicaId: string;
  clinicaNome: string; // denormalizado
  data: string; // yyyy-mm-dd
  status: StatusExame;
  observacoes?: string;
  possuiASO: boolean;
  aso: InfoASO | null;
  criadoEm: string;
  atualizadoEm: string;
}

export type ExameInput = Omit<Exame, "id" | "criadoEm" | "atualizadoEm">;
