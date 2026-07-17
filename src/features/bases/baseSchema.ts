import { z } from "zod";

export const baseSchema = z.object({
  nome: z.string().min(2, "Informe o nome da base."),
  cidade: z.string().min(1, "Informe a cidade."),
  estado: z.string().min(1, "Selecione o estado."),
  responsavel: z.string().min(1, "Informe o responsável."),
  telefone: z.string().optional(),
  status: z.enum(["ativo", "inativo"]),
});

export type BaseFormValues = z.infer<typeof baseSchema>;
