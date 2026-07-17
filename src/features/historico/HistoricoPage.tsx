import { useMemo, useState } from "react";
import { History, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { useDebounce } from "@/hooks/useDebounce";
import { formatarDataHoraBR } from "@/lib/format";
import { useHistoricoQuery } from "./useHistorico";
import { ACAO_LABEL, ACAO_BADGE, ENTIDADE_LABEL } from "./historicoLabels";
import type { AcaoHistorico, EntidadeHistorico } from "@/types/historico";

export function HistoricoPage() {
  const { data: registros, isLoading } = useHistoricoQuery();

  const [busca, setBusca] = useState("");
  const buscaDebounced = useDebounce(busca, 250);
  const [filtroEntidade, setFiltroEntidade] = useState<EntidadeHistorico | "">("");
  const [filtroAcao, setFiltroAcao] = useState<AcaoHistorico | "">("");

  const filtrados = useMemo(() => {
    if (!registros) return [];
    const termo = buscaDebounced.trim().toLowerCase();

    return registros.filter((r) => {
      const bateBusca =
        !termo || r.descricao.toLowerCase().includes(termo) || r.usuarioNome.toLowerCase().includes(termo);
      const bateEntidade = !filtroEntidade || r.entidade === filtroEntidade;
      const bateAcao = !filtroAcao || r.acao === filtroAcao;
      return bateBusca && bateEntidade && bateAcao;
    });
  }, [registros, buscaDebounced, filtroEntidade, filtroAcao]);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-display text-xl font-bold text-slate-800">Histórico</h2>
        <p className="text-sm text-slate-500">
          {registros ? `${registros.length} registro(s) — mostrando os mais recentes` : "Carregando..."}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Pesquisar por descrição ou usuário..." className="pl-9" />
        </div>
        <Select value={filtroEntidade} onChange={(e) => setFiltroEntidade(e.target.value as EntidadeHistorico | "")} className="sm:w-52">
          <option value="">Todos os módulos</option>
          {(Object.keys(ENTIDADE_LABEL) as EntidadeHistorico[]).map((e) => (
            <option key={e} value={e}>{ENTIDADE_LABEL[e]}</option>
          ))}
        </Select>
        <Select value={filtroAcao} onChange={(e) => setFiltroAcao(e.target.value as AcaoHistorico | "")} className="sm:w-44">
          <option value="">Todas as ações</option>
          {(Object.keys(ACAO_LABEL) as AcaoHistorico[]).map((a) => (
            <option key={a} value={a}>{ACAO_LABEL[a]}</option>
          ))}
        </Select>
      </div>

      {isLoading ? (
        <div className="rounded-[var(--radius-lg)] border border-slate-200 bg-white py-20 text-center text-sm text-slate-400">Carregando...</div>
      ) : filtrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-slate-300 bg-white py-20 text-center">
          <History className="h-8 w-8 text-slate-300" />
          <p className="mt-3 text-sm font-medium text-slate-600">
            {busca || filtroEntidade || filtroAcao ? "Nenhum registro encontrado para esse filtro." : "Nenhuma atividade registrada ainda."}
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data/Hora</TableHead>
              <TableHead>Módulo</TableHead>
              <TableHead>Ação</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Responsável</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtrados.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="whitespace-nowrap text-slate-500">{formatarDataHoraBR(r.criadoEm)}</TableCell>
                <TableCell className="whitespace-nowrap">{ENTIDADE_LABEL[r.entidade]}</TableCell>
                <TableCell>
                  <Badge variant={ACAO_BADGE[r.acao]}>{ACAO_LABEL[r.acao]}</Badge>
                </TableCell>
                <TableCell className="text-slate-600">{r.descricao}</TableCell>
                <TableCell className="whitespace-nowrap font-medium text-slate-800">{r.usuarioNome}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
