import { z } from "zod";

const camposComuns = {
  nome: z.string().min(3, "Informe o nome completo."),
  email: z.string().min(1, "Informe o e-mail.").email("E-mail inválido."),
  perfil: z.enum(["administrador", "supervisor", "operador", "consulta"]),
  baseId: z.string(), // "" = sem base específica (acesso não restrito por base)
  telefone: z.string().optional(),
  status: z.enum(["ativo", "inativo"]),
};

/**
 * Schema do formulário de usuário. Na criação a senha é obrigatória (o admin define
 * a senha de acesso na hora); na edição o campo nem é exibido, então fica opcional.
 */
export function criarUsuarioSchema(modoEdicao: boolean) {
  return z.object({
    ...camposComuns,
    senha: modoEdicao
      ? z.string().optional()
      : z
          .string()
          .min(6, "A senha deve ter pelo menos 6 caracteres.")
          .max(72, "A senha pode ter no máximo 72 caracteres."),
  });
}

export type UsuarioFormValues = z.infer<ReturnType<typeof criarUsuarioSchema>>;
