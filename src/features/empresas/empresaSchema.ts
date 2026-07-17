import { z } from "zod";
import { validarCNPJ, limparCNPJ } from "@/lib/cnpj";

export const empresaSchema = z.object({
  nome: z.string().min(2, "Informe o nome da empresa."),
  cnpj: z
    .string()
    .optional()
    .refine((v) => !v || limparCNPJ(v).length === 0 || validarCNPJ(v), "CNPJ inválido."),
  responsavel: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().optional().refine((v) => !v || z.string().email().safeParse(v).success, "E-mail inválido."),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  status: z.enum(["ativo", "inativo"]),
  observacoes: z.string().optional(),
});

export type EmpresaFormValues = z.infer<typeof empresaSchema>;
