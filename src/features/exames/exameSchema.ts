import { z } from "zod";

export const exameSchema = z
  .object({
    colaboradorId: z.string().min(1, "Selecione o colaborador."),
    tipoId: z.string().min(1, "Selecione o tipo de exame."),
    clinicaId: z.string().min(1, "Selecione a clínica."),
    data: z.string().min(1, "Informe a data do exame."),
    status: z.enum(["pendente", "concluido", "cancelado"]),
    observacoes: z.string().optional(),
    possuiASO: z.boolean(),
    asoNomeArquivo: z.string().optional(),
    asoNumeroDocumento: z.string().optional(),
    asoLinkExterno: z.string().optional(),
    asoObservacao: z.string().optional(),
  })
  .superRefine((valores, ctx) => {
    if (!valores.possuiASO) return;

    if (!valores.asoNomeArquivo?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["asoNomeArquivo"], message: "Informe o nome do arquivo." });
    }
    if (!valores.asoNumeroDocumento?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["asoNumeroDocumento"], message: "Informe o número do documento." });
    }
    if (valores.asoLinkExterno && !/^https?:\/\/.+/.test(valores.asoLinkExterno)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["asoLinkExterno"], message: "Link deve começar com http:// ou https://" });
    }
  });

export type ExameFormValues = z.infer<typeof exameSchema>;
