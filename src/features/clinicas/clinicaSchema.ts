import { z } from "zod";
import { validarCNPJ, limparCNPJ } from "@/lib/cnpj";

export const clinicaSchema = z.object({
  nome: z.string().min(2, "Informe o nome da clínica."),
  cnpj: z
    .string()
    .min(1, "Informe o CNPJ.")
    .refine((v) => limparCNPJ(v).length === 14, "CNPJ deve ter 14 dígitos.")
    .refine((v) => validarCNPJ(v), "CNPJ inválido."),
  responsavel: z.string().min(1, "Informe o responsável."),
  telefone: z.string().min(1, "Informe o telefone."),
  email: z.string().min(1, "Informe o e-mail.").email("E-mail inválido."),
  cidade: z.string().min(1, "Informe a cidade."),
  estado: z.string().min(1, "Selecione o estado."),
  observacoes: z.string().optional(),
  status: z.enum(["ativo", "inativo"]),
});

export type ClinicaFormValues = z.infer<typeof clinicaSchema>;
