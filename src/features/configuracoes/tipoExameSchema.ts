import { z } from "zod";

export const tipoExameSchema = z.object({
  nome: z.string().min(2, "Informe o nome do tipo de exame."),
});

export type TipoExameFormValues = z.infer<typeof tipoExameSchema>;
