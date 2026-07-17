import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Dices } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { formatarTelefone } from "@/lib/format";
import { useBasesQuery } from "@/features/bases/useBases";
import { PERFIL_LABEL } from "@/config/perfilLabels";
import { criarUsuarioSchema, type UsuarioFormValues } from "./usuarioSchema";
import { existeUsuarioComEmail, gerarSenhaAleatoria, type CriarUsuarioInput, type UsuarioInput } from "./usuarioService";
import type { Usuario, Perfil } from "@/types/auth";

interface UsuarioFormDialogProps {
  aberto: boolean;
  onFechar: () => void;
  usuario: Usuario | null; // null = criação
  onSalvar: (input: UsuarioInput | CriarUsuarioInput) => Promise<void>;
  salvando: boolean;
  /** true quando o usuário em edição é o próprio admin logado — bloqueia auto-desativação/auto-rebaixamento */
  ehProprioUsuario: boolean;
}

const valoresPadrao: UsuarioFormValues = {
  nome: "",
  email: "",
  senha: "",
  perfil: "operador",
  baseId: "",
  telefone: "",
  status: "ativo",
};

const PERFIS: Perfil[] = ["administrador", "supervisor", "operador", "consulta"];

export function UsuarioFormDialog({
  aberto,
  onFechar,
  usuario,
  onSalvar,
  salvando,
  ehProprioUsuario,
}: UsuarioFormDialogProps) {
  const { data: bases, isLoading: carregandoBases } = useBasesQuery();
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    setError,
    setValue,
    formState: { errors },
  } = useForm<UsuarioFormValues>({
    resolver: zodResolver(criarUsuarioSchema(!!usuario)),
    defaultValues: valoresPadrao,
  });

  useEffect(() => {
    if (!aberto) return;
    setMostrarSenha(false);
    if (usuario) {
      reset({
        nome: usuario.nome,
        email: usuario.email,
        senha: "",
        perfil: usuario.perfil,
        baseId: usuario.baseId ?? "",
        telefone: usuario.telefone ?? "",
        status: usuario.status,
      });
    } else {
      reset(valoresPadrao);
    }
  }, [aberto, usuario, reset]);

  function handleGerarSenha() {
    setValue("senha", gerarSenhaAleatoria(), { shouldValidate: true });
    setMostrarSenha(true);
  }

  async function onSubmit(values: UsuarioFormValues) {
    if (!usuario) {
      const duplicado = await existeUsuarioComEmail(values.email);
      if (duplicado) {
        setError("email", { message: "Já existe um usuário cadastrado com este e-mail." });
        return;
      }
    }

    if (usuario) {
      await onSalvar({
        nome: values.nome,
        email: values.email,
        perfil: values.perfil,
        baseId: values.baseId || null,
        telefone: values.telefone,
        status: values.status,
      });
    } else {
      await onSalvar({
        nome: values.nome,
        email: values.email,
        senha: values.senha ?? "",
        perfil: values.perfil,
        baseId: values.baseId || null,
        telefone: values.telefone,
        status: values.status,
      });
    }
  }

  return (
    <Dialog
      aberto={aberto}
      onFechar={onFechar}
      titulo={usuario ? "Editar usuário" : "Novo usuário"}
      descricao={
        usuario
          ? undefined
          : "Defina a senha de acesso do usuário e repasse-a a ele por um canal seguro."
      }
      largura="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="nome">Nome completo</Label>
            <Input id="nome" hasError={!!errors.nome} {...register("nome")} />
            {errors.nome && <p className="text-xs text-danger">{errors.nome.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              disabled={!!usuario}
              hasError={!!errors.email}
              {...register("email")}
            />
            {usuario ? (
              <p className="text-xs text-slate-400">
                O e-mail de login não pode ser alterado por aqui.
              </p>
            ) : (
              errors.email && <p className="text-xs text-danger">{errors.email.message}</p>
            )}
          </div>

          {!usuario && (
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="senha">Senha de acesso</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="senha"
                    type={mostrarSenha ? "text" : "password"}
                    autoComplete="new-password"
                    hasError={!!errors.senha}
                    className="pr-9"
                    {...register("senha")}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha((v) => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {mostrarSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <Button type="button" variant="outline" onClick={handleGerarSenha} className="shrink-0">
                  <Dices className="h-4 w-4" />
                  Gerar
                </Button>
              </div>
              {errors.senha ? (
                <p className="text-xs text-danger">{errors.senha.message}</p>
              ) : (
                <p className="text-xs text-slate-400">Mínimo de 6 caracteres. O usuário pode trocá-la depois.</p>
              )}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="perfil">Perfil de acesso</Label>
            <Select id="perfil" disabled={ehProprioUsuario} {...register("perfil")}>
              {PERFIS.map((p) => (
                <option key={p} value={p}>
                  {PERFIL_LABEL[p]}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="baseId">Base</Label>
            <Select id="baseId" disabled={carregandoBases} {...register("baseId")}>
              <option value="">Todas as bases</option>
              {bases?.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.nome}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="telefone">Telefone</Label>
            <Controller
              control={control}
              name="telefone"
              render={({ field }) => (
                <Input
                  id="telefone"
                  inputMode="numeric"
                  placeholder="(00) 00000-0000"
                  value={field.value}
                  onChange={(e) => field.onChange(formatarTelefone(e.target.value))}
                />
              )}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="status">Status</Label>
            <Select id="status" disabled={ehProprioUsuario} {...register("status")}>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </Select>
            {ehProprioUsuario && (
              <p className="text-xs text-slate-400">Não é possível alterar o próprio perfil ou status.</p>
            )}
          </div>
        </div>

        <div className="mt-2 flex justify-end gap-2 border-t border-slate-200 pt-4">
          <Button type="button" variant="ghost" onClick={onFechar}>
            Cancelar
          </Button>
          <Button type="submit" loading={salvando}>
            {usuario ? "Salvar alterações" : "Cadastrar usuário"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
