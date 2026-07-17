import type { Perfil } from "@/types/auth";
import type { MatrizPermissoes, Modulo } from "@/types/permissions";

const acessoTotal = { visualizar: true, criar: true, editar: true, excluir: true, exportar: true, importar: true };
const somenteLeitura = { visualizar: true, criar: false, editar: false, excluir: false, exportar: true, importar: false };
const operacional = { visualizar: true, criar: true, editar: true, excluir: false, exportar: true, importar: false };
const semAcesso = { visualizar: false, criar: false, editar: false, excluir: false, exportar: false, importar: false };

/**
 * Matriz de permissões por perfil.
 * Fonte única de verdade para: menu lateral, rotas protegidas e botões de ação.
 */
export const PERMISSOES: Record<Perfil, MatrizPermissoes> = {
  administrador: {
    dashboard: acessoTotal,
    colaboradores: acessoTotal,
    exames: acessoTotal,
    importacao: acessoTotal,
    historico: acessoTotal,
    clinicas: acessoTotal,
    empresas: acessoTotal,
    bases: acessoTotal,
    usuarios: acessoTotal,
    relatorios: acessoTotal,
    configuracoes: acessoTotal,
    meuPerfil: acessoTotal,
  },
  supervisor: {
    dashboard: acessoTotal,
    colaboradores: acessoTotal,
    exames: acessoTotal,
    importacao: operacional,
    historico: somenteLeitura,
    clinicas: operacional,
    empresas: somenteLeitura,
    bases: somenteLeitura,
    usuarios: semAcesso,
    relatorios: acessoTotal,
    configuracoes: semAcesso,
    meuPerfil: acessoTotal,
  },
  operador: {
    dashboard: { visualizar: true },
    colaboradores: operacional,
    exames: operacional,
    importacao: { visualizar: true, importar: true },
    historico: somenteLeitura,
    clinicas: somenteLeitura,
    empresas: semAcesso,
    bases: semAcesso,
    usuarios: semAcesso,
    relatorios: somenteLeitura,
    configuracoes: semAcesso,
    meuPerfil: acessoTotal,
  },
  consulta: {
    dashboard: { visualizar: true },
    colaboradores: somenteLeitura,
    exames: somenteLeitura,
    importacao: semAcesso,
    historico: somenteLeitura,
    clinicas: somenteLeitura,
    empresas: semAcesso,
    bases: semAcesso,
    usuarios: semAcesso,
    relatorios: somenteLeitura,
    configuracoes: semAcesso,
    meuPerfil: acessoTotal,
  },
};

/** Verifica se um perfil pode visualizar um módulo (usado para montar o menu e proteger rotas) */
export function podeAcessarModulo(perfil: Perfil, modulo: Modulo): boolean {
  return Boolean(PERMISSOES[perfil]?.[modulo]?.visualizar);
}

/** Verifica se um perfil pode executar uma ação específica em um módulo (usado nos botões) */
export function podeExecutarAcao(
  perfil: Perfil,
  modulo: Modulo,
  acao: keyof typeof acessoTotal
): boolean {
  return Boolean(PERMISSOES[perfil]?.[modulo]?.[acao]);
}
