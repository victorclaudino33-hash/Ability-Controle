/** Remove tudo que não for dígito */
export function limparCPF(cpf: string): string {
  return cpf.replace(/\D/g, "");
}

/** Formata dígitos para o padrão 000.000.000-00 conforme o usuário digita */
export function formatarCPF(valor: string): string {
  const digitos = limparCPF(valor).slice(0, 11);
  return digitos
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

/** Validação do dígito verificador do CPF (algoritmo oficial) */
export function validarCPF(cpf: string): boolean {
  const digitos = limparCPF(cpf);
  if (digitos.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digitos)) return false; // todos os dígitos iguais

  const calcularDigito = (base: string, pesoInicial: number) => {
    let soma = 0;
    for (let i = 0; i < base.length; i++) {
      soma += Number(base[i]) * (pesoInicial - i);
    }
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };

  const d1 = calcularDigito(digitos.slice(0, 9), 10);
  const d2 = calcularDigito(digitos.slice(0, 10), 11);

  return d1 === Number(digitos[9]) && d2 === Number(digitos[10]);
}
