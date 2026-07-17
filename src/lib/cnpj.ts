export function limparCNPJ(cnpj: string): string {
  return cnpj.replace(/\D/g, "");
}

/** Formata dígitos para o padrão 00.000.000/0000-00 conforme o usuário digita */
export function formatarCNPJ(valor: string): string {
  const digitos = limparCNPJ(valor).slice(0, 14);
  return digitos
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

/** Validação do dígito verificador do CNPJ (algoritmo oficial) */
export function validarCNPJ(cnpj: string): boolean {
  const digitos = limparCNPJ(cnpj);
  if (digitos.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(digitos)) return false;

  const calcularDigito = (base: string) => {
    const pesos = base.length === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const soma = base.split("").reduce((acc, num, i) => acc + Number(num) * pesos[i], 0);
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  const d1 = calcularDigito(digitos.slice(0, 12));
  const d2 = calcularDigito(digitos.slice(0, 12) + d1);

  return d1 === Number(digitos[12]) && d2 === Number(digitos[13]);
}
