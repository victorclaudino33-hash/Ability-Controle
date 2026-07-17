import type { StatusRegistro } from "./empresaBase";

/** Documento salvo em Firestore: coleção "clinicas" */
export interface Clinica {
  id: string;
  nome: string;
  cnpj: string;
  responsavel: string;
  telefone: string;
  email: string;
  cidade: string;
  estado: string;
  observacoes?: string;
  status: StatusRegistro;
  criadoEm: string;
  atualizadoEm: string;
}

export type ClinicaInput = Omit<Clinica, "id" | "criadoEm" | "atualizadoEm">;
