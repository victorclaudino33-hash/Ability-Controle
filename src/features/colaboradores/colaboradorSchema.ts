import { z } from "zod";
import { validarCPF, limparCPF } from "@/lib/cpf";

export const colaboradorSchema = z.object({
  nome: z.string().min(3, "Informe o nome completo."),
  cpf: z
    .string()
    .min(1, "Informe o CPF.")
    .refine((v) => limparCPF(v).length === 11, "CPF deve ter 11 dígitos.")
    .refine((v) => validarCPF(v), "CPF inválido."),
  re: z.string().min(1, "Informe o RE."),
  empresaId: z.string().min(1, "Selecione a empresa."),
  baseId: z.string().min(1, "Selecione a base."),
  supervisor: z.string().min(1, "Informe o supervisor."),
  cargo: z.string().min(1, "Informe o cargo."),
  telefone: z
    .string()
    .min(1, "Informe o telefone.")
    .refine((v) => v.replace(/\D/g, "").length >= 10, "Telefone inválido."),
  email: z.string().min(1, "Informe o e-mail.").email("E-mail inválido."),
  dataAdmissao: z.string().min(1, "Informe a data de admissão."),
  status: z.enum(["ativo", "inativo"]),
});

export type ColaboradorFormValues = z.infer<typeof colaboradorSchema>;
