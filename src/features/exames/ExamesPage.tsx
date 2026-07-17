import { useMemo, useState } from "react";
import { Plus, Search, Pencil, Trash2, ClipboardList, FileCheck2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ConfirmarExclusaoDialog } from "@/components/shared/ConfirmarExclusaoDialog";
import { useAuth } from "@/contexts/AuthContext";
import { podeExecutarAcao } from "@/config/permissions";
import { useDebounce } from "@/hooks/useDebounce";
import { formatarDataBR } from "@/lib/format";
import { useTiposExameQuery } from "@/features/configuracoes/useTiposExame";
import { useExamesQuery, useCriarExame, useAtualizarExame, useExcluirExame } from "./useExames";
import { ExameFormDialog } from "./ExameFormDialog";
import { STATUS_EXAME_LABEL, STATUS_EXAME_BADGE } from "./statusExame";
import type { Exame, ExameInput, StatusExame } from "@/types/exame";

export function ExamesPage() {
  const { usuario } = useAuth();
  const perfil = usuario!.perfil;

  const podeCriar = podeExecutarAcao(perfil, "exames", "criar");
  const podeEditar = podeExecutarAcao(perfil, "exames", "editar");
  const podeExcluir = podeExecutarAcao(perfil, "exames", "excluir");

  const { data: exames, isLoading } = useExamesQuery();
  const { data: tipos } = useTiposExameQuery();
  const criar = useCriarExame();
  const atualizar = useAtualizarExame();
  const excluir = useExcluirExame();

  const [busca, setBusca] = useState("");
  const buscaDebounced = useDebounce(busca, 250);
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<StatusExame | "">("");

  const [formAberto, setFormAberto] = useState(false);
  const [emEdicao, setEmEdicao] = useState<Exame | null>(null);
  const [paraExcluir, setParaExcluir] = useState<Exame | null>(null);

  const filtrados = useMemo(() => {
    if (!exames) return [];
    const termo = buscaDebounced.trim().toLowerCase();

    return exames.filter((e) => {
      const bateBusca =
        !termo ||
        e.colaboradorNome.toLowerCase().includes(termo) ||
        e.clinicaNome.toLowerCase().includes(termo) ||
        e.colaboradorCpf.includes(termo.replace(/\D/g, ""));
      const bateTipo = !filtroTipo || e.tipoId === filtroTipo;
      const bateStatus = !filtroStatus || e.status === filtroStatus;
      return bateBusca && bateTipo && bateStatus;
    });
  }, [exames, buscaDebounced, filtroTipo, filtroStatus]);

  function abrirCriacao() {
    setEmEdicao(null);
    setFormAberto(true);
  }

  async function handleSalvar(input: ExameInput) {
    if (emEdicao) await atualizar.mutateAsync({ id: emEdicao.id, input, usuario: usuario! });
    else await criar.mutateAsync({ input, usuario: usuario! });
    setFormAberto(false);
  }

  async function handleExcluir() {
    if (!paraExcluir) return;
    await excluir.mutateAsync({ exame: paraExcluir, usuario: usuario! });
    setParaExcluir(null);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-slate-800">Exames</h2>
          <p className="text-sm text-slate-500">{exames ? `${exames.length} exame(s) cadastrado(s)` : "Carregando..."}</p>
        </div>
        {podeCriar && (
          <Button onClick={abrirCriacao}>
            <Plus className="h-4 w-4" />
            Novo exame
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Pesquisar por colaborador, CPF ou clínica..." className="pl-9" />
        </div>
        <Select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} className="sm:w-52">
          <option value="">Todos os tipos</option>
          {tipos?.map((t) => (
            <option key={t.id} value={t.id}>{t.nome}</option>
          ))}
        </Select>
        <Select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value as StatusExame | "")} className="sm:w-44">
          <option value="">Todos os status</option>
          <option value="pendente">Pendente</option>
          <option value="concluido">Concluído</option>
          <option value="cancelado">Cancelado</option>
        </Select>
      </div>

      {isLoading ? (
        <div className="rounded-[var(--radius-lg)] border border-slate-200 bg-white py-20 text-center text-sm text-slate-400">Carregando...</div>
      ) : filtrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-slate-300 bg-white py-20 text-center">
          <ClipboardList className="h-8 w-8 text-slate-300" />
          <p className="mt-3 text-sm font-medium text-slate-600">
            {busca || filtroTipo || filtroStatus ? "Nenhum exame encontrado para esse filtro." : "Nenhum exame cadastrado ainda."}
          </p>
          {podeCriar && !busca && !filtroTipo && !filtroStatus && (
            <Button variant="outline" size="sm" className="mt-4" onClick={abrirCriacao}>
              <Plus className="h-4 w-4" />
              Cadastrar o primeiro exame
            </Button>
          )}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Colaborador</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Clínica</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>ASO</TableHead>
              <TableHead>Status</TableHead>
              {(podeEditar || podeExcluir) && <TableHead className="text-right">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtrados.map((e) => (
              <TableRow key={e.id}>
                <TableCell className="font-medium text-slate-800">{e.colaboradorNome}</TableCell>
                <TableCell>{e.tipoNome}</TableCell>
                <TableCell>{e.clinicaNome}</TableCell>
                <TableCell>{formatarDataBR(e.data)}</TableCell>
                <TableCell>
                  {e.possuiASO ? (
                    <span className="inline-flex items-center gap-1.5 text-success">
                      <FileCheck2 className="h-4 w-4" />
                      {e.aso?.linkExterno ? (
                        <a href={e.aso.linkExterno} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline-offset-2 hover:underline">
                          {e.aso.numeroDocumento || "Ver"}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-slate-600">{e.aso?.numeroDocumento || "—"}</span>
                      )}
                    </span>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_EXAME_BADGE[e.status]}>{STATUS_EXAME_LABEL[e.status]}</Badge>
                </TableCell>
                {(podeEditar || podeExcluir) && (
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      {podeEditar && (
                        <Button variant="ghost" size="icon" onClick={() => { setEmEdicao(e); setFormAberto(true); }} aria-label={`Editar exame de ${e.colaboradorNome}`}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      {podeExcluir && (
                        <Button variant="ghost" size="icon" onClick={() => setParaExcluir(e)} aria-label={`Excluir exame de ${e.colaboradorNome}`} className="hover:text-danger">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <ExameFormDialog aberto={formAberto} onFechar={() => setFormAberto(false)} exame={emEdicao} onSalvar={handleSalvar} salvando={criar.isPending || atualizar.isPending} />

      <ConfirmarExclusaoDialog
        aberto={!!paraExcluir}
        onFechar={() => setParaExcluir(null)}
        onConfirmar={handleExcluir}
        titulo="Excluir exame"
        descricao={`Tem certeza que deseja excluir o exame de "${paraExcluir?.colaboradorNome}"? Essa ação não pode ser desfeita.`}
        excluindo={excluir.isPending}
      />
    </div>
  );
}
