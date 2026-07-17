import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { tipoExameSchema, type TipoExameFormValues } from "./tipoExameSchema";
import type { TipoExame } from "@/types/tipoExame";

interface TipoExameFormDialogProps {
  aberto: boolean;
  onFechar: () => void;
  tipo: TipoExame | null; // null = criação
  onSalvar: (nome: string) => Promise<void>;
  salvando: boolean;
}

export function TipoExameFormDialog({ aberto, onFechar, tipo, onSalvar, salvando }: TipoExameFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TipoExameFormValues>({
    resolver: zodResolver(tipoExameSchema),
    defaultValues: { nome: "" },
  });

  useEffect(() => {
    if (!aberto) return;
    reset({ nome: tipo?.nome ?? "" });
  }, [aberto, tipo, reset]);

  async function onSubmit(values: TipoExameFormValues) {
    await onSalvar(values.nome);
  }

  return (
    <Dialog aberto={aberto} onFechar={onFechar} titulo={tipo ? "Renomear tipo de exame" : "Novo tipo de exame"} largura="sm">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="nome">Nome</Label>
          <Input id="nome" autoFocus hasError={!!errors.nome} {...register("nome")} />
          {errors.nome && <p className="text-xs text-danger">{errors.nome.message}</p>}
        </div>

        <div className="mt-2 flex justify-end gap-2 border-t border-slate-200 pt-4">
          <Button type="button" variant="ghost" onClick={onFechar}>
            Cancelar
          </Button>
          <Button type="submit" loading={salvando}>
            {tipo ? "Salvar alterações" : "Cadastrar tipo"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
