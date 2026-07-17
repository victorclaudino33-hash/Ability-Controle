import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { formatarCNPJ } from "@/lib/cnpj";
import { formatarTelefone } from "@/lib/format";
import { ESTADOS_BR } from "@/config/estados";
import { clinicaSchema, type ClinicaFormValues } from "./clinicaSchema";
import type { Clinica, ClinicaInput } from "@/types/clinica";

interface ClinicaFormDialogProps {
  aberto: boolean;
  onFechar: () => void;
  clinica: Clinica | null;
  onSalvar: (input: ClinicaInput) => Promise<void>;
  salvando: boolean;
}

const valoresPadrao: ClinicaFormValues = {
  nome: "",
  cnpj: "",
  responsavel: "",
  telefone: "",
  email: "",
  cidade: "",
  estado: "",
  observacoes: "",
  status: "ativo",
};

export function ClinicaFormDialog({ aberto, onFechar, clinica, onSalvar, salvando }: ClinicaFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<ClinicaFormValues>({ resolver: zodResolver(clinicaSchema), defaultValues: valoresPadrao });

  useEffect(() => {
    if (!aberto) return;
    if (clinica) {
      reset({
        nome: clinica.nome,
        cnpj: formatarCNPJ(clinica.cnpj),
        responsavel: clinica.responsavel,
        telefone: clinica.telefone,
        email: clinica.email,
        cidade: clinica.cidade,
        estado: clinica.estado,
        observacoes: clinica.observacoes ?? "",
        status: clinica.status,
      });
    } else {
      reset(valoresPadrao);
    }
  }, [aberto, clinica, reset]);

  async function onSubmit(values: ClinicaFormValues) {
    await onSalvar(values);
  }

  return (
    <Dialog aberto={aberto} onFechar={onFechar} titulo={clinica ? "Editar clínica" : "Nova clínica"} largura="lg">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="nome">Nome da clínica</Label>
            <Input id="nome" hasError={!!errors.nome} {...register("nome")} />
            {errors.nome && <p className="text-xs text-danger">{errors.nome.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cnpj">CNPJ</Label>
            <Controller
              control={control}
              name="cnpj"
              render={({ field }) => (
                <Input id="cnpj" placeholder="00.000.000/0000-00" hasError={!!errors.cnpj} value={field.value} onChange={(e) => field.onChange(formatarCNPJ(e.target.value))} />
              )}
            />
            {errors.cnpj && <p className="text-xs text-danger">{errors.cnpj.message}</p>}
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
                <Input id="telefone" placeholder="(00) 00000-0000" hasError={!!errors.telefone} value={field.value} onChange={(e) => field.onChange(formatarTelefone(e.target.value))} />
              )}
            />
            {errors.telefone && <p className="text-xs text-danger">{errors.telefone.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" hasError={!!errors.email} {...register("email")} />
            {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
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
            <Label htmlFor="status">Status</Label>
            <Select id="status" {...register("status")}>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea id="observacoes" {...register("observacoes")} />
          </div>
        </div>

        <div className="mt-2 flex justify-end gap-2 border-t border-slate-200 pt-4">
          <Button type="button" variant="ghost" onClick={onFechar}>Cancelar</Button>
          <Button type="submit" loading={salvando}>{clinica ? "Salvar alterações" : "Cadastrar clínica"}</Button>
        </div>
      </form>
    </Dialog>
  );
}
