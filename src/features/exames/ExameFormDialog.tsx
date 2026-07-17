import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileCheck2 } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SeletorColaborador } from "@/components/shared/SeletorColaborador";
import { SeletorComCadastroRapido } from "@/components/shared/SeletorComCadastroRapido";
import { useColaboradoresQuery } from "@/features/colaboradores/useColaboradores";
import { useClinicasQuery } from "@/features/clinicas/useClinicas";
import { useTiposExameQuery, useCriarTipoExameRapido } from "@/features/configuracoes/useTiposExame";
import { exameSchema, type ExameFormValues } from "./exameSchema";
import type { Exame, ExameInput } from "@/types/exame";

interface ExameFormDialogProps {
  aberto: boolean;
  onFechar: () => void;
  exame: Exame | null;
  onSalvar: (input: ExameInput) => Promise<void>;
  salvando: boolean;
}

const valoresPadrao: ExameFormValues = {
  colaboradorId: "",
  tipoId: "",
  clinicaId: "",
  data: "",
  status: "pendente",
  observacoes: "",
  possuiASO: false,
  asoNomeArquivo: "",
  asoNumeroDocumento: "",
  asoLinkExterno: "",
  asoObservacao: "",
};

export function ExameFormDialog({ aberto, onFechar, exame, onSalvar, salvando }: ExameFormDialogProps) {
  const { data: colaboradores, isLoading: carregandoColaboradores } = useColaboradoresQuery();
  const { data: clinicas, isLoading: carregandoClinicas } = useClinicasQuery();
  const { data: tipos, isLoading: carregandoTipos } = useTiposExameQuery();
  const criarTipo = useCriarTipoExameRapido();

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm<ExameFormValues>({ resolver: zodResolver(exameSchema), defaultValues: valoresPadrao });

  const possuiASO = watch("possuiASO");

  useEffect(() => {
    if (!aberto) return;
    if (exame) {
      reset({
        colaboradorId: exame.colaboradorId,
        tipoId: exame.tipoId,
        clinicaId: exame.clinicaId,
        data: exame.data,
        status: exame.status,
        observacoes: exame.observacoes ?? "",
        possuiASO: exame.possuiASO,
        asoNomeArquivo: exame.aso?.nomeArquivo ?? "",
        asoNumeroDocumento: exame.aso?.numeroDocumento ?? "",
        asoLinkExterno: exame.aso?.linkExterno ?? "",
        asoObservacao: exame.aso?.observacao ?? "",
      });
    } else {
      reset(valoresPadrao);
    }
  }, [aberto, exame, reset]);

  async function onSubmit(values: ExameFormValues) {
    const colaborador = colaboradores?.find((c) => c.id === values.colaboradorId);
    const tipo = tipos?.find((t) => t.id === values.tipoId);
    const clinica = clinicas?.find((c) => c.id === values.clinicaId);

    await onSalvar({
      colaboradorId: values.colaboradorId,
      colaboradorNome: colaborador?.nome ?? "",
      colaboradorCpf: colaborador?.cpf ?? "",
      tipoId: values.tipoId,
      tipoNome: tipo?.nome ?? "",
      clinicaId: values.clinicaId,
      clinicaNome: clinica?.nome ?? "",
      data: values.data,
      status: values.status,
      observacoes: values.observacoes,
      possuiASO: values.possuiASO,
      aso: values.possuiASO
        ? {
            nomeArquivo: values.asoNomeArquivo ?? "",
            numeroDocumento: values.asoNumeroDocumento ?? "",
            linkExterno: values.asoLinkExterno || undefined,
            observacao: values.asoObservacao || undefined,
          }
        : null,
    });
  }

  return (
    <Dialog aberto={aberto} onFechar={onFechar} titulo={exame ? "Editar exame" : "Novo exame"} largura="lg">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <Controller
          control={control}
          name="colaboradorId"
          render={({ field }) => (
            <SeletorColaborador
              colaboradores={colaboradores}
              carregando={carregandoColaboradores}
              value={field.value}
              hasError={!!errors.colaboradorId}
              onChange={(id) => field.onChange(id)}
            />
          )}
        />
        {errors.colaboradorId && <p className="-mt-3 text-xs text-danger">{errors.colaboradorId.message}</p>}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Controller
            control={control}
            name="tipoId"
            render={({ field }) => (
              <SeletorComCadastroRapido
                label="Tipo de exame"
                placeholder="Selecione o tipo"
                itens={tipos}
                carregando={carregandoTipos}
                value={field.value}
                hasError={!!errors.tipoId}
                onChange={(id) => field.onChange(id)}
                onCriar={(nome) => criarTipo.mutateAsync(nome)}
                tituloCadastroRapido="Cadastrar novo tipo de exame"
              />
            )}
          />

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="clinicaId">Clínica</Label>
            <Select id="clinicaId" hasError={!!errors.clinicaId} disabled={carregandoClinicas} {...register("clinicaId")}>
              <option value="">{carregandoClinicas ? "Carregando..." : "Selecione a clínica"}</option>
              {clinicas?.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </Select>
            {clinicas?.length === 0 && !carregandoClinicas && (
              <p className="text-xs text-slate-400">Nenhuma clínica cadastrada — cadastre em "Clínicas" primeiro.</p>
            )}
            {errors.clinicaId && <p className="text-xs text-danger">{errors.clinicaId.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="data">Data do exame</Label>
            <Input id="data" type="date" hasError={!!errors.data} {...register("data")} />
            {errors.data && <p className="text-xs text-danger">{errors.data.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="status">Status</Label>
            <Select id="status" {...register("status")}>
              <option value="pendente">Pendente</option>
              <option value="concluido">Concluído</option>
              <option value="cancelado">Cancelado</option>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea id="observacoes" {...register("observacoes")} />
          </div>
        </div>

        <label className="flex cursor-pointer items-center gap-2.5 rounded-[var(--radius-md)] border border-slate-200 bg-slate-50 px-4 py-3">
          <input type="checkbox" className="h-4 w-4 accent-ability-red" {...register("possuiASO")} />
          <FileCheck2 className="h-4 w-4 text-slate-500" />
          <span className="text-sm font-medium text-slate-700">Possui ASO (Atestado de Saúde Ocupacional)</span>
        </label>

        {possuiASO && (
          <div className="grid grid-cols-1 gap-4 rounded-[var(--radius-md)] border border-slate-200 p-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="asoNomeArquivo">Nome do arquivo</Label>
              <Input id="asoNomeArquivo" placeholder="ex: aso_joao_silva.pdf" hasError={!!errors.asoNomeArquivo} {...register("asoNomeArquivo")} />
              {errors.asoNomeArquivo && <p className="text-xs text-danger">{errors.asoNomeArquivo.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="asoNumeroDocumento">Número do documento</Label>
              <Input id="asoNumeroDocumento" hasError={!!errors.asoNumeroDocumento} {...register("asoNumeroDocumento")} />
              {errors.asoNumeroDocumento && <p className="text-xs text-danger">{errors.asoNumeroDocumento.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="asoLinkExterno">Link externo (opcional)</Label>
              <Input id="asoLinkExterno" placeholder="https://..." hasError={!!errors.asoLinkExterno} {...register("asoLinkExterno")} />
              {errors.asoLinkExterno && <p className="text-xs text-danger">{errors.asoLinkExterno.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="asoObservacao">Observação do ASO</Label>
              <Input id="asoObservacao" {...register("asoObservacao")} />
            </div>
          </div>
        )}

        <div className="mt-2 flex justify-end gap-2 border-t border-slate-200 pt-4">
          <Button type="button" variant="ghost" onClick={onFechar}>Cancelar</Button>
          <Button type="submit" loading={salvando}>{exame ? "Salvar alterações" : "Cadastrar exame"}</Button>
        </div>
      </form>
    </Dialog>
  );
}
