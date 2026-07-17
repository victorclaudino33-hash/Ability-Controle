import * as XLSX from "xlsx";
import type { LinhaPlanilha } from "@/types/importacao";

/** Remove acentos, baixa a caixa e colapsa espaços — usado para casar cabeçalhos e nomes com tolerância a variação. */
export function normalizarTexto(valor: string): string {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

/**
 * Lê um arquivo .xlsx ou .csv e retorna as linhas como objetos, com as chaves já
 * normalizadas (ver normalizarTexto) para casar com CABECALHOS_* dos serviços de importação.
 * O SheetJS detecta o formato automaticamente pelo conteúdo do arquivo.
 */
export async function lerArquivoPlanilha(arquivo: File): Promise<LinhaPlanilha[]> {
  const buffer = await arquivo.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array", raw: false, codepage: 65001 });
  const primeiraAba = workbook.SheetNames[0];
  if (!primeiraAba) return [];

  const planilha = workbook.Sheets[primeiraAba];
  const linhas = XLSX.utils.sheet_to_json<Record<string, unknown>>(planilha, {
    defval: "",
    raw: false,
  });

  return linhas.map((linha) => {
    const normalizada: LinhaPlanilha = {};
    for (const [chave, valor] of Object.entries(linha)) {
      normalizada[normalizarTexto(chave)] = String(valor ?? "").trim();
    }
    return normalizada;
  });
}

/** Gera e baixa um arquivo .xlsx modelo com os cabeçalhos esperados e uma linha de exemplo. */
export function baixarModeloPlanilha(
  nomeArquivo: string,
  cabecalhos: string[],
  linhaExemplo: string[]
): void {
  const planilha = XLSX.utils.aoa_to_sheet([cabecalhos, linhaExemplo]);
  planilha["!cols"] = cabecalhos.map((c) => ({ wch: Math.max(c.length + 2, 14) }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, planilha, "Modelo");
  XLSX.writeFile(workbook, nomeArquivo);
}

/** Gera e baixa um arquivo .xlsx com dados arbitrários (usado pela exportação de Relatórios). */
export function exportarPlanilha(
  nomeArquivo: string,
  cabecalhos: string[],
  linhas: (string | number)[][],
  nomeAba = "Dados"
): void {
  const planilha = XLSX.utils.aoa_to_sheet([cabecalhos, ...linhas]);
  planilha["!cols"] = cabecalhos.map((c) => ({ wch: Math.max(c.length + 2, 14) }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, planilha, nomeAba);
  XLSX.writeFile(workbook, nomeArquivo);
}

/** Converte uma data em dd/mm/aaaa, aaaa-mm-dd ou serial do Excel para o formato ISO (aaaa-mm-dd). Retorna null se inválida. */
export function normalizarData(valor: string): string | null {
  const v = valor.trim();
  if (!v) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;

  const brMatch = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (brMatch) {
    const [, dia, mes, ano] = brMatch;
    return `${ano}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;
  }

  // Serial de data do Excel (ex: 45678), caso a célula não tenha vindo formatada como texto
  if (/^\d+(\.\d+)?$/.test(v)) {
    const serial = Number(v);
    const data = new Date(Math.round((serial - 25569) * 86400 * 1000));
    if (!Number.isNaN(data.getTime())) {
      return data.toISOString().slice(0, 10);
    }
  }

  return null;
}
