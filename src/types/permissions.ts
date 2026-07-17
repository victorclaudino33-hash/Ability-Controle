/** Cada módulo/rota do sistema. Usado para montar o menu e proteger rotas. */
export type Modulo =
  | "dashboard"
  | "colaboradores"
  | "exames"
  | "importacao"
  | "historico"
  | "clinicas"
  | "empresas"
  | "bases"
  | "usuarios"
  | "relatorios"
  | "configuracoes"
  | "meuPerfil";

/** Ações possíveis dentro de um módulo */
export type Acao = "visualizar" | "criar" | "editar" | "excluir" | "exportar" | "importar";

/** Mapa de permissões de um módulo específico */
export type PermissoesModulo = Partial<Record<Acao, boolean>>;

/** Permissões completas de um perfil: módulo -> ações permitidas */
export type MatrizPermissoes = Record<Modulo, PermissoesModulo>;
