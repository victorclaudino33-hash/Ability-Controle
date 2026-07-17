/** Documento salvo em Firestore: coleção "tiposExame" */
export interface TipoExame {
  id: string;
  nome: string;
  padrao?: boolean; // true para os tipos que vêm pré-cadastrados pelo sistema
  criadoEm: string;
}
