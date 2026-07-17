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
import { empresaSchema, type EmpresaFormValues } from "./empresaSchema";
import type { Empresa, EmpresaInput } from "@/types/empresaBase";

interface EmpresaFormDialogProps {
  aberto: boolean;
  onFechar: () => void;
  empresa: Empresa | null;
  onSalvar: (input: EmpresaInput) => Promise<void>;
  salvando: boolean;
}

const valoresPadrao: EmpresaFormValues = {
  nome: "",
  cnpj: "",
  responsavel: "",
  telefone: "",
  email: "",
  cidade: "",
  estado: "",
  status: "ativo",
  observacoes: "",
};

export function EmpresaFormDialog({ aberto, onFechar, empresa, onSalvar, salvando }: EmpresaFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<EmpresaFormValues>({ resolver: zodResolver(empresaSchema), defaultValues: valoresPadrao });

  useEffect(() => {
    if (!aberto) return;
    if (empresa) {
      reset({
        nome: empresa.nome,
        cnpj: empresa.cnpj ? formatarCNPJ(empresa.cnpj) : "",
        responsavel: empresa.responsavel ?? "",
        telefone: empresa.telefone ?? "",
        email: empresa.email ?? "",
        cidade: empresa.cidade ?? "",
        estado: empresa.estado ?? "",
        status: empresa.status ?? "ativo",
        observacoes: empresa.observacoes ?? "",
      });
    } else {
      reset(valoresPadrao);
    }
  }, [aberto, empresa, reset]);

  async function onSubmit(values: EmpresaFormValues) {
    await onSalvar(values);
  }

  return (
    <Dialog aberto={aberto} onFechar={onFechar} titulo={empresa ? "Editar empresa" : "Nova empresa"} largura="lg">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="nome">Nome da empresa</Label>
            <Input id="nome" hasError={!!errors.nome} {...register("nome")} />
            {errors.nome && <p className="text-xs text-danger">{errors.nome.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cnpj">CNPJ</Label>
            <Controller
              control={control}
              name="cnpj"
              render={({ field }) => (
                <Input
                  id="cnpj"
                  placeholder="00.000.000/0000-00"
                  hasError={!!errors.cnpj}
                  value={field.value}
                  onChange={(e) => field.onChange(formatarCNPJ(e.target.value))}
                />
              )}
            />
            {errors.cnpj && <p className="text-xs text-danger">{errors.cnpj.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="responsavel">Responsável</Label>
            <Input id="responsavel" {...register("responsavel")} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="telefone">Telefone</Label>
            <Controller
              control={control}
              name="telefone"
              render={({ field }) => (
                <Input
                  id="telefone"
                  placeholder="(00) 00000-0000"
                  value={field.value}
                  onChange={(e) => field.onChange(formatarTelefone(e.target.value))}
                />
              )}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" hasError={!!errors.email} {...register("email")} />
            {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cidade">Cidade</Label>
            <Input id="cidade" {...register("cidade")} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="estado">Estado</Label>
            <Select id="estado" {...register("estado")}>
              <option value="">Selecione</option>
              {ESTADOS_BR.map((uf) => (
                <option key={uf} value={uf}>{uf}</option>
              ))}
            </Select>
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
          <Button type="submit" loading={salvando}>
            {empresa ? "Salvar alterações" : "Cadastrar empresa"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
