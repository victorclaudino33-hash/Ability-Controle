export type TipoImportacao = "colaboradores" | "exames";

export type StatusLinhaImportacao = "sucesso" | "ignorada" | "erro";

/** Resultado do processamento de uma linha da planilha */
export interface ResultadoLinha {
  linha: number; // número da linha na planilha (contando o cabeçalho como linha 1)
  status: StatusLinhaImportacao;
  identificador: string; // valor que identifica a linha p/ o usuário (ex: nome, CPF)
  mensagem?: string; // motivo, quando ignorada ou erro
}

/** Resumo final de uma importação em massa */
export interface ResultadoImportacao {
  total: number;
  sucesso: number;
  ignoradas: number;
  erros: number;
  detalhes: ResultadoLinha[];
}

/** Linha crua lida da planilha — chaves normalizadas, valores sempre string */
export type LinhaPlanilha = Record<string, string>;
