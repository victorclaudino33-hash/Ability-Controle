import { useMemo, useState } from "react";
import { Plus, Search, Pencil, Trash2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ConfirmarExclusaoDialog } from "@/components/shared/ConfirmarExclusaoDialog";
import { useAuth } from "@/contexts/AuthContext";
import { podeExecutarAcao } from "@/config/permissions";
import { useDebounce } from "@/hooks/useDebounce";
import { formatarCNPJ } from "@/lib/cnpj";
import { useClinicasQuery, useCriarClinica, useAtualizarClinica, useExcluirClinica } from "./useClinicas";
import { ClinicaFormDialog } from "./ClinicaFormDialog";
import type { Clinica, ClinicaInput } from "@/types/clinica";

export function ClinicasPage() {
  const { usuario } = useAuth();
  const perfil = usuario!.perfil;

  const podeCriar = podeExecutarAcao(perfil, "clinicas", "criar");
  const podeEditar = podeExecutarAcao(perfil, "clinicas", "editar");
  const podeExcluir = podeExecutarAcao(perfil, "clinicas", "excluir");

  const { data: clinicas, isLoading } = useClinicasQuery();
  const criar = useCriarClinica();
  const atualizar = useAtualizarClinica();
  const excluir = useExcluirClinica();

  const [busca, setBusca] = useState("");
  const buscaDebounced = useDebounce(busca, 250);
  const [formAberto, setFormAberto] = useState(false);
  const [emEdicao, setEmEdicao] = useState<Clinica | null>(null);
  const [paraExcluir, setParaExcluir] = useState<Clinica | null>(null);

  const filtradas = useMemo(() => {
    if (!clinicas) return [];
    const termo = buscaDebounced.trim().toLowerCase();
    if (!termo) return clinicas;
    return clinicas.filter(
      (c) =>
        c.nome.toLowerCase().includes(termo) ||
        c.cidade.toLowerCase().includes(termo) ||
        c.cnpj.includes(termo.replace(/\D/g, ""))
    );
  }, [clinicas, buscaDebounced]);

  function abrirCriacao() {
    setEmEdicao(null);
    setFormAberto(true);
  }

  async function handleSalvar(input: ClinicaInput) {
    if (emEdicao) await atualizar.mutateAsync({ id: emEdicao.id, input });
    else await criar.mutateAsync(input);
    setFormAberto(false);
  }

  async function handleExcluir() {
    if (!paraExcluir) return;
    await excluir.mutateAsync(paraExcluir.id);
    setParaExcluir(null);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-slate-800">Clínicas</h2>
          <p className="text-sm text-slate-500">{clinicas ? `${clinicas.length} clínica(s) cadastrada(s)` : "Carregando..."}</p>
        </div>
        {podeCriar && (
          <Button onClick={abrirCriacao}>
            <Plus className="h-4 w-4" />
            Nova clínica
          </Button>
        )}
      </div>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Pesquisar por nome, cidade ou CNPJ..." className="pl-9" />
      </div>

      {isLoading ? (
        <div className="rounded-[var(--radius-lg)] border border-slate-200 bg-white py-20 text-center text-sm text-slate-400">Carregando...</div>
      ) : filtradas.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-slate-300 bg-white py-20 text-center">
          <Building2 className="h-8 w-8 text-slate-300" />
          <p className="mt-3 text-sm font-medium text-slate-600">
            {busca ? "Nenhuma clínica encontrada." : "Nenhuma clínica cadastrada ainda."}
          </p>
          {podeCriar && !busca && (
            <Button variant="outline" size="sm" className="mt-4" onClick={abrirCriacao}>
              <Plus className="h-4 w-4" />
              Cadastrar a primeira clínica
            </Button>
          )}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>CNPJ</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Cidade/UF</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Status</TableHead>
              {(podeEditar || podeExcluir) && <TableHead className="text-right">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtradas.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium text-slate-800">{c.nome}</TableCell>
                <TableCell>{formatarCNPJ(c.cnpj)}</TableCell>
                <TableCell>{c.responsavel}</TableCell>
                <TableCell>{c.cidade}/{c.estado}</TableCell>
                <TableCell>{c.telefone}</TableCell>
                <TableCell>
                  <Badge variant={c.status === "inativo" ? "neutral" : "success"}>
                    {c.status === "inativo" ? "Inativo" : "Ativo"}
                  </Badge>
                </TableCell>
                {(podeEditar || podeExcluir) && (
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      {podeEditar && (
                        <Button variant="ghost" size="icon" onClick={() => { setEmEdicao(c); setFormAberto(true); }} aria-label={`Editar ${c.nome}`}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      {podeExcluir && (
                        <Button variant="ghost" size="icon" onClick={() => setParaExcluir(c)} aria-label={`Excluir ${c.nome}`} className="hover:text-danger">
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

      <ClinicaFormDialog aberto={formAberto} onFechar={() => setFormAberto(false)} clinica={emEdicao} onSalvar={handleSalvar} salvando={criar.isPending || atualizar.isPending} />

      <ConfirmarExclusaoDialog
        aberto={!!paraExcluir}
        onFechar={() => setParaExcluir(null)}
        onConfirmar={handleExcluir}
        titulo="Excluir clínica"
        descricao={`Tem certeza que deseja excluir "${paraExcluir?.nome}"? Essa ação não pode ser desfeita.`}
        excluindo={excluir.isPending}
      />
    </div>
  );
}
