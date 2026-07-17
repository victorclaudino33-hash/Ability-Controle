/**
 * Nomes centralizados das coleções do Firestore.
 * Usar sempre estas constantes em vez de strings soltas nas queries.
 */
export const COLLECTIONS = {
  USUARIOS: "usuarios",
  BASES: "bases",
  EMPRESAS: "empresas",
  COLABORADORES: "colaboradores",
  CLINICAS: "clinicas",
  EXAMES: "exames",
  HISTORICO: "historico",
  TIPOS_EXAME: "tiposExame",
  CONFIGURACOES: "configuracoes",
} as const;
