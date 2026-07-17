/** Formata dígitos para telefone (99) 99999-9999 ou (99) 9999-9999 */
export function formatarTelefone(valor: string): string {
  const digitos = valor.replace(/\D/g, "").slice(0, 11);
  if (digitos.length <= 10) {
    return digitos
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d{1,4})$/, "$1-$2");
  }
  return digitos
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d{1,4})$/, "$1-$2");
}

/** Converte "2026-07-15" (input type=date) para "15/07/2026" */
export function formatarDataBR(dataISO: string | undefined | null): string {
  if (!dataISO) return "—";
  const [ano, mes, dia] = dataISO.split("-");
  if (!ano || !mes || !dia) return dataISO;
  return `${dia}/${mes}/${ano}`;
}

/** Formata um ISO datetime (ex: registros de histórico) para "15/07/2026 14:32" */
export function formatarDataHoraBR(dataISO: string | undefined | null): string {
  if (!dataISO) return "—";
  const data = new Date(dataISO);
  if (Number.isNaN(data.getTime())) return dataISO;
  return data.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
