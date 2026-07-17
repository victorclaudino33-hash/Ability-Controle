/**
 * Perfis de acesso do sistema.
 * Administrador: acesso total.
 * Supervisor: acesso amplo, sem módulos administrativos sensíveis.
 * Operador: acesso somente aos módulos operacionais permitidos.
 * Consulta: acesso somente leitura.
 */
export type Perfil = "administrador" | "supervisor" | "operador" | "consulta";

export type StatusUsuario = "ativo" | "inativo";

/** Documento salvo em Firestore: coleção "usuarios" (uid do doc = uid do Firebase Auth) */
export interface Usuario {
  uid: string;
  nome: string;
  email: string;
  perfil: Perfil;
  baseId: string | null;
  telefone?: string;
  status: StatusUsuario;
  criadoEm: string;
  atualizadoEm: string;
}

/** Usuário autenticado + dados de perfil já resolvidos, usado no AuthContext */
export interface UsuarioAutenticado extends Usuario {
  emailVerificado: boolean;
}
