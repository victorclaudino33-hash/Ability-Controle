import { useMemo, useState } from "react";
import { Download, FileBarChart, ClipboardList, Hourglass, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { podeExecutarAcao } from "@/config/permissions";
import { formatarDataBR } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useExamesQuery } from "@/features/exames/useExames";
import { useColaboradoresQuery } from "@/features/colaboradores/useColaboradores";
import { useEmpresasQuery } from "@/features/empresas/useEmpresas";
import { useBasesQuery } from "@/features/bases/useBases";
import { useClinicasQuery } from "@/features/clinicas/useClinicas";
import { useTiposExameQuery } from "@/features/configuracoes/useTiposExame";
import { STATUS_EXAME_LABEL, STATUS_EXAME_BADGE } from "@/features/exames/statusExame";
import { exportarPlanilha } from "@/features/importacao/planilha";
import type { StatusExame } from "@/types/exame";

export function RelatoriosPage() {
  const { usuario } = useAuth();
  const perfil = usuario!.perfil;
  const podeExportar = podeExecutarAcao(perfil, "relatorios", "exportar");

  const { data: exames, isLoading } = useExamesQuery();
  const { data: colaboradores } = useColaboradoresQuery();
  const { data: empresas } = useEmpresasQuery();
  const { data: bases } = useBasesQuery();
  const { data: clinicas } = useClinicasQuery();
  const { data: tipos } = useTiposExameQuery();

  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [filtroEmpresa, setFiltroEmpresa] = useState("");
  const [filtroBase, setFiltroBase] = useState("");
  const [filtroClinica, setFiltroClinica] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<StatusExame | "">("");

  const mapaColaboradores = useMemo(
    () => new Map((colaboradores ?? []).map((c) => [c.id, c])),
    [colaboradores]
  );

  const linhas = useMemo(() => {
    if (!exames) return [];
    return exames.map((e) => {
      const colaborador = mapaColaboradores.get(e.colaboradorId);
      return {
        exame: e,
        empresaId: colaborador?.empresaId ?? "",
        empresaNome: colaborador?.empresaNome ?? "—",
        baseId: colaborador?.baseId ?? "",
        baseNome: colaborador?.baseNome ?? "—",
      };
    });
  }, [exames, mapaColaboradores]);

  const filtrados = useMemo(() => {
    return linhas.filter(({ exame, empresaId, baseId }) => {
      const bateInicio = !dataInicio || exame.data >= dataInicio;
      const bateFim = !dataFim || exame.data <= dataFim;
      const bateEmpresa = !filtroEmpresa || empresaId === filtroEmpresa;
      const bateBase = !filtroBase || baseId === filtroBase;
      const bateClinica = !filtroClinica || exame.clinicaId === filtroClinica;
      const bateTipo = !filtroTipo || exame.tipoId === filtroTipo;
      const bateStatus = !filtroStatus || exame.status === filtroStatus;
      return bateInicio && bateFim && bateEmpresa && bateBase && bateClinica && bateTipo && bateStatus;
    });
  }, [linhas, dataInicio, dataFim, filtroEmpresa, filtroBase, filtroClinica, filtroTipo, filtroStatus]);

  const resumo = useMemo(() => {
    return {
      total: filtrados.length,
      concluidos: filtrados.filter((l) => l.exame.status === "concluido").length,
      pendentes: filtrados.filter((l) => l.exame.status === "pendente").length,
      cancelados: filtrados.filter((l) => l.exame.status === "cancelado").length,
    };
  }, [filtrados]);

  function limparFiltros() {
    setDataInicio("");
    setDataFim("");
    setFiltroEmpresa("");
    setFiltroBase("");
    setFiltroClinica("");
    setFiltroTipo("");
    setFiltroStatus("");
  }

  function exportar() {
    const cabecalhos = ["Colaborador", "CPF", "Empresa", "Base", "Tipo de exame", "Clínica", "Data", "Status"];
    const dados = filtrados.map(({ exame, empresaNome, baseNome }) => [
      exame.colaboradorNome,
      exame.colaboradorCpf,
      empresaNome,
      baseNome,
      exame.tipoNome,
      exame.clinicaNome,
      formatarDataBR(exame.data),
      STATUS_EXAME_LABEL[exame.status],
    ]);
    const hoje = new Date().toISOString().slice(0, 10);
    exportarPlanilha(`relatorio-exames-${hoje}.xlsx`, cabecalhos, dados, "Exames");
  }

  const cards: { label: string; valor: number; icon: typeof ClipboardList; tone: "neutral" | "success" | "warning" | "danger" }[] = [
    { label: "Total no filtro", valor: resumo.total, icon: ClipboardList, tone: "neutral" },
    { label: "Concluídos", valor: resumo.concluidos, icon: CheckCircle2, tone: "success" },
    { label: "Pendentes", valor: resumo.pendentes, icon: Hourglass, tone: "warning" },
    { label: "Cancelados", valor: resumo.cancelados, icon: XCircle, tone: "danger" },
  ];

  const toneClasses = {
    neutral: "bg-slate-100 text-slate-600",
    success: "bg-success-light text-success",
    warning: "bg-warning-light text-warning",
    danger: "bg-danger-light text-danger",
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-slate-800">Relatórios</h2>
          <p className="text-sm text-slate-500">Filtre os exames cadastrados e exporte para planilha.</p>
        </div>
        {podeExportar && (
          <Button onClick={exportar} disabled={filtrados.length === 0}>
            <Download className="h-4 w-4" />
            Exportar ({filtrados.length})
          </Button>
        )}
      </div>

      <div className="rounded-[var(--radius-lg)] border border-slate-200 bg-white p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="dataInicio">De</Label>
            <Input id="dataInicio" type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="dataFim">Até</Label>
            <Input id="dataFim" type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="filtroEmpresa">Empresa</Label>
            <Select id="filtroEmpresa" value={filtroEmpresa} onChange={(e) => setFiltroEmpresa(e.target.value)}>
              <option value="">Todas</option>
              {empresas?.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.nome}</option>
              ))}
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="filtroBase">Base</Label>
            <Select id="filtroBase" value={filtroBase} onChange={(e) => setFiltroBase(e.target.value)}>
              <option value="">Todas</option>
              {bases?.map((b) => (
                <option key={b.id} value={b.id}>{b.nome}</option>
              ))}
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="filtroClinica">Clínica</Label>
            <Select id="filtroClinica" value={filtroClinica} onChange={(e) => setFiltroClinica(e.target.value)}>
              <option value="">Todas</option>
              {clinicas?.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="filtroTipo">Tipo de exame</Label>
            <Select id="filtroTipo" value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
              <option value="">Todos</option>
              {tipos?.map((t) => (
                <option key={t.id} value={t.id}>{t.nome}</option>
              ))}
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="filtroStatus">Status</Label>
            <Select id="filtroStatus" value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value as StatusExame | "")}>
              <option value="">Todos</option>
              <option value="pendente">Pendente</option>
              <option value="concluido">Concluído</option>
              <option value="cancelado">Cancelado</option>
            </Select>
          </div>
          <div className="flex items-end">
            <Button variant="outline" onClick={limparFiltros} className="w-full">
              Limpar filtros
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardContent className="flex items-start justify-between p-4">
              <div>
                <p className="text-xs font-medium text-slate-500">{card.label}</p>
                <p className="mt-1.5 font-display text-2xl font-bold text-slate-800">{card.valor}</p>
              </div>
              <div className={cn("flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)]", toneClasses[card.tone])}>
                <card.icon className="h-4.5 w-4.5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isLoading ? (
        <div className="rounded-[var(--radius-lg)] border border-slate-200 bg-white py-20 text-center text-sm text-slate-400">Carregando...</div>
      ) : filtrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-slate-300 bg-white py-20 text-center">
          <FileBarChart className="h-8 w-8 text-slate-300" />
          <p className="mt-3 text-sm font-medium text-slate-600">Nenhum exame encontrado para esse filtro.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Colaborador</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Base</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Clínica</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtrados.map(({ exame, empresaNome, baseNome }) => (
              <TableRow key={exame.id}>
                <TableCell className="font-medium text-slate-800">{exame.colaboradorNome}</TableCell>
                <TableCell>{empresaNome}</TableCell>
                <TableCell>{baseNome}</TableCell>
                <TableCell>{exame.tipoNome}</TableCell>
                <TableCell>{exame.clinicaNome}</TableCell>
                <TableCell>{formatarDataBR(exame.data)}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_EXAME_BADGE[exame.status]}>{STATUS_EXAME_LABEL[exame.status]}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
