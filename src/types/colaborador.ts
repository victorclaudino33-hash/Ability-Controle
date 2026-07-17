export type StatusColaborador = "ativo" | "inativo";

/** Documento salvo em Firestore: coleção "colaboradores" */
export interface Colaborador {
  id: string;
  nome: string;
  cpf: string; // salvo somente com dígitos (limparCPF)
  re: string;
  empresaId: string;
  empresaNome: string; // denormalizado para listar/pesquisar sem join
  baseId: string;
  baseNome: string; // denormalizado
  supervisor: string;
  cargo: string;
  telefone: string;
  email: string;
  dataAdmissao: string; // formato ISO (yyyy-mm-dd)
  status: StatusColaborador;
  criadoEm: string;
  atualizadoEm: string;
}

/** Payload para criar/editar (sem campos gerados pelo Firestore) */
export type ColaboradorInput = Omit<Colaborador, "id" | "criadoEm" | "atualizadoEm">;
