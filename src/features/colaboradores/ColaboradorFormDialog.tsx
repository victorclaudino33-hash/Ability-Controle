import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { SeletorComCadastroRapido } from "@/components/shared/SeletorComCadastroRapido";
import { useEmpresasQuery, useCriarEmpresaRapida } from "@/features/empresas/useEmpresas";
import { useBasesQuery, useCriarBaseRapida } from "@/features/bases/useBases";
import { formatarCPF } from "@/lib/cpf";
import { formatarTelefone } from "@/lib/format";
import { colaboradorSchema, type ColaboradorFormValues } from "./colaboradorSchema";
import { existeColaboradorComCPF } from "./colaboradorService";
import type { Colaborador, ColaboradorInput } from "@/types/colaborador";

interface ColaboradorFormDialogProps {
  aberto: boolean;
  onFechar: () => void;
  colaborador: Colaborador | null; // null = criação
  onSalvar: (input: ColaboradorInput) => Promise<void>;
  salvando: boolean;
}

const valoresPadrao: ColaboradorFormValues = {
  nome: "",
  cpf: "",
  re: "",
  empresaId: "",
  baseId: "",
  supervisor: "",
  cargo: "",
  telefone: "",
  email: "",
  dataAdmissao: "",
  status: "ativo",
};

export function ColaboradorFormDialog({
  aberto,
  onFechar,
  colaborador,
  onSalvar,
  salvando,
}: ColaboradorFormDialogProps) {
  const { data: empresas, isLoading: carregandoEmpresas } = useEmpresasQuery();
  const { data: bases, isLoading: carregandoBases } = useBasesQuery();
  const criarEmpresa = useCriarEmpresaRapida();
  const criarBase = useCriarBaseRapida();

  const {
    register,
    handleSubmit,
    reset,
    control,
    setError,
    formState: { errors },
  } = useForm<ColaboradorFormValues>({
    resolver: zodResolver(colaboradorSchema),
    defaultValues: valoresPadrao,
  });

  useEffect(() => {
    if (!aberto) return;
    if (colaborador) {
      reset({
        nome: colaborador.nome,
        cpf: formatarCPF(colaborador.cpf),
        re: colaborador.re,
        empresaId: colaborador.empresaId,
        baseId: colaborador.baseId,
        supervisor: colaborador.supervisor,
        cargo: colaborador.cargo,
        telefone: colaborador.telefone,
        email: colaborador.email,
        dataAdmissao: colaborador.dataAdmissao,
        status: colaborador.status,
      });
    } else {
      reset(valoresPadrao);
    }
  }, [aberto, colaborador, reset]);

  async function onSubmit(values: ColaboradorFormValues) {
    const cpfDuplicado = await existeColaboradorComCPF(values.cpf, colaborador?.id);
    if (cpfDuplicado) {
      setError("cpf", { message: "Já existe um colaborador cadastrado com este CPF." });
      return;
    }

    const empresaSelecionada = empresas?.find((e) => e.id === values.empresaId);
    const baseSelecionada = bases?.find((b) => b.id === values.baseId);

    await onSalvar({
      ...values,
      empresaNome: empresaSelecionada?.nome ?? "",
      baseNome: baseSelecionada?.nome ?? "",
    });
  }

  return (
    <Dialog
      aberto={aberto}
      onFechar={onFechar}
      titulo={colaborador ? "Editar colaborador" : "Novo colaborador"}
      largura="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="nome">Nome completo</Label>
            <Input id="nome" hasError={!!errors.nome} {...register("nome")} />
            {errors.nome && <p className="text-xs text-danger">{errors.nome.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cpf">CPF</Label>
            <Controller
              control={control}
              name="cpf"
              render={({ field }) => (
                <Input
                  id="cpf"
                  inputMode="numeric"
                  placeholder="000.000.000-00"
                  hasError={!!errors.cpf}
                  value={field.value}
                  onChange={(e) => field.onChange(formatarCPF(e.target.value))}
                />
              )}
            />
            {errors.cpf && <p className="text-xs text-danger">{errors.cpf.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="re">RE</Label>
            <Input id="re" hasError={!!errors.re} {...register("re")} />
            {errors.re && <p className="text-xs text-danger">{errors.re.message}</p>}
          </div>

          <Controller
            control={control}
            name="empresaId"
            render={({ field }) => (
              <SeletorComCadastroRapido
                label="Empresa"
                placeholder="Selecione a empresa"
                itens={empresas}
                carregando={carregandoEmpresas}
                value={field.value}
                hasError={!!errors.empresaId}
                onChange={(id) => field.onChange(id)}
                onCriar={(nome) => criarEmpresa.mutateAsync(nome)}
                tituloCadastroRapido="Cadastrar nova empresa"
              />
            )}
          />
          {errors.empresaId && <p className="-mt-3 text-xs text-danger">{errors.empresaId.message}</p>}

          <Controller
            control={control}
            name="baseId"
            render={({ field }) => (
              <SeletorComCadastroRapido
                label="Base"
                placeholder="Selecione a base"
                itens={bases}
                carregando={carregandoBases}
                value={field.value}
                hasError={!!errors.baseId}
                onChange={(id) => field.onChange(id)}
                onCriar={(nome) => criarBase.mutateAsync(nome)}
                tituloCadastroRapido="Cadastrar nova base"
              />
            )}
          />
          {errors.baseId && <p className="-mt-3 text-xs text-danger">{errors.baseId.message}</p>}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="supervisor">Supervisor</Label>
            <Input id="supervisor" hasError={!!errors.supervisor} {...register("supervisor")} />
            {errors.supervisor && <p className="text-xs text-danger">{errors.supervisor.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cargo">Cargo</Label>
            <Input id="cargo" hasError={!!errors.cargo} {...register("cargo")} />
            {errors.cargo && <p className="text-xs text-danger">{errors.cargo.message}</p>}
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
                  hasError={!!errors.telefone}
                  value={field.value}
                  onChange={(e) => field.onChange(formatarTelefone(e.target.value))}
                />
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
            <Label htmlFor="dataAdmissao">Data de admissão</Label>
            <Input
              id="dataAdmissao"
              type="date"
              hasError={!!errors.dataAdmissao}
              {...register("dataAdmissao")}
            />
            {errors.dataAdmissao && <p className="text-xs text-danger">{errors.dataAdmissao.message}</p>}
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
          <Button type="button" variant="ghost" onClick={onFechar}>
            Cancelar
          </Button>
          <Button type="submit" loading={salvando}>
            {colaborador ? "Salvar alterações" : "Cadastrar colaborador"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
