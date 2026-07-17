export type StatusRegistro = "ativo" | "inativo";

/** Documento salvo em Firestore: coleção "empresas" */
export interface Empresa {
  id: string;
  nome: string;
  cnpj?: string;
  responsavel?: string;
  telefone?: string;
  email?: string;
  cidade?: string;
  estado?: string;
  status?: StatusRegistro;
  observacoes?: string;
  criadoEm: string;
  atualizadoEm?: string;
}

export type EmpresaInput = Omit<Empresa, "id" | "criadoEm" | "atualizadoEm">;

/** Documento salvo em Firestore: coleção "bases" */
export interface Base {
  id: string;
  nome: string;
  cidade?: string;
  estado?: string;
  responsavel?: string;
  telefone?: string;
  status?: StatusRegistro;
  criadoEm: string;
  atualizadoEm?: string;
}

export type BaseInput = Omit<Base, "id" | "criadoEm" | "atualizadoEm">;
