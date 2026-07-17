import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { formatarTelefone } from "@/lib/format";
import { ESTADOS_BR } from "@/config/estados";
import { baseSchema, type BaseFormValues } from "./baseSchema";
import type { Base, BaseInput } from "@/types/empresaBase";

interface BaseFormDialogProps {
  aberto: boolean;
  onFechar: () => void;
  base: Base | null;
  onSalvar: (input: BaseInput) => Promise<void>;
  salvando: boolean;
}

const valoresPadrao: BaseFormValues = {
  nome: "",
  cidade: "",
  estado: "",
  responsavel: "",
  telefone: "",
  status: "ativo",
};

export function BaseFormDialog({ aberto, onFechar, base, onSalvar, salvando }: BaseFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<BaseFormValues>({ resolver: zodResolver(baseSchema), defaultValues: valoresPadrao });

  useEffect(() => {
    if (!aberto) return;
    if (base) {
      reset({
        nome: base.nome,
        cidade: base.cidade ?? "",
        estado: base.estado ?? "",
        responsavel: base.responsavel ?? "",
        telefone: base.telefone ?? "",
        status: base.status ?? "ativo",
      });
    } else {
      reset(valoresPadrao);
    }
  }, [aberto, base, reset]);

  async function onSubmit(values: BaseFormValues) {
    await onSalvar(values);
  }

  return (
    <Dialog aberto={aberto} onFechar={onFechar} titulo={base ? "Editar base" : "Nova base"} largura="md">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="nome">Nome da base</Label>
            <Input id="nome" hasError={!!errors.nome} {...register("nome")} />
            {errors.nome && <p className="text-xs text-danger">{errors.nome.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cidade">Cidade</Label>
            <Input id="cidade" hasError={!!errors.cidade} {...register("cidade")} />
            {errors.cidade && <p className="text-xs text-danger">{errors.cidade.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="estado">Estado</Label>
            <Select id="estado" hasError={!!errors.estado} {...register("estado")}>
              <option value="">Selecione</option>
              {ESTADOS_BR.map((uf) => (
                <option key={uf} value={uf}>{uf}</option>
              ))}
            </Select>
            {errors.estado && <p className="text-xs text-danger">{errors.estado.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="responsavel">Responsável</Label>
            <Input id="responsavel" hasError={!!errors.responsavel} {...register("responsavel")} />
            {errors.responsavel && <p className="text-xs text-danger">{errors.responsavel.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="telefone">Telefone</Label>
            <Controller
              control={control}
              name="telefone"
              render={({ field }) => (
                <Input id="telefone" placeholder="(00) 00000-0000" value={field.value} onChange={(e) => field.onChange(formatarTelefone(e.target.value))} />
              )}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="status">Status</Label>
            <Select id="status" {...register("status")}>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </Select>
          </div>
        </div>

        <div className="mt-2 flex justify-end gap-2 border-t border-slate-200 pt-4">
          <Button type="button" variant="ghost" onClick={onFechar}>Cancelar</Button>
          <Button type="submit" loading={salvando}>{base ? "Salvar alterações" : "Cadastrar base"}</Button>
        </div>
      </form>
    </Dialog>
  );
}
