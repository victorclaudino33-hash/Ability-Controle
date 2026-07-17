import { useMemo, useState } from "react";
import { Plus, Search, Pencil, Trash2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ConfirmarExclusaoDialog } from "@/components/shared/ConfirmarExclusaoDialog";
import { useAuth } from "@/contexts/AuthContext";
import { podeExecutarAcao } from "@/config/permissions";
import { useDebounce } from "@/hooks/useDebounce";
import { useBasesQuery, useCriarBase, useAtualizarBase, useExcluirBase } from "./useBases";
import { BaseFormDialog } from "./BaseFormDialog";
import type { Base, BaseInput } from "@/types/empresaBase";

export function BasesPage() {
  const { usuario } = useAuth();
  const perfil = usuario!.perfil;

  const podeCriar = podeExecutarAcao(perfil, "bases", "criar");
  const podeEditar = podeExecutarAcao(perfil, "bases", "editar");
  const podeExcluir = podeExecutarAcao(perfil, "bases", "excluir");

  const { data: bases, isLoading } = useBasesQuery();
  const criar = useCriarBase();
  const atualizar = useAtualizarBase();
  const excluir = useExcluirBase();

  const [busca, setBusca] = useState("");
  const buscaDebounced = useDebounce(busca, 250);
  const [formAberto, setFormAberto] = useState(false);
  const [emEdicao, setEmEdicao] = useState<Base | null>(null);
  const [paraExcluir, setParaExcluir] = useState<Base | null>(null);

  const filtradas = useMemo(() => {
    if (!bases) return [];
    const termo = buscaDebounced.trim().toLowerCase();
    if (!termo) return bases;
    return bases.filter(
      (b) => b.nome.toLowerCase().includes(termo) || (b.cidade ?? "").toLowerCase().includes(termo)
    );
  }, [bases, buscaDebounced]);

  function abrirCriacao() {
    setEmEdicao(null);
    setFormAberto(true);
  }

  async function handleSalvar(input: BaseInput) {
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
          <h2 className="font-display text-xl font-bold text-slate-800">Bases</h2>
          <p className="text-sm text-slate-500">{bases ? `${bases.length} base(s) cadastrada(s)` : "Carregando..."}</p>
        </div>
        {podeCriar && (
          <Button onClick={abrirCriacao}>
            <Plus className="h-4 w-4" />
            Nova base
          </Button>
        )}
      </div>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Pesquisar por nome ou cidade..." className="pl-9" />
      </div>

      {isLoading ? (
        <div className="rounded-[var(--radius-lg)] border border-slate-200 bg-white py-20 text-center text-sm text-slate-400">Carregando...</div>
      ) : filtradas.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-slate-300 bg-white py-20 text-center">
          <MapPin className="h-8 w-8 text-slate-300" />
          <p className="mt-3 text-sm font-medium text-slate-600">
            {busca ? "Nenhuma base encontrada." : "Nenhuma base cadastrada ainda."}
          </p>
          {podeCriar && !busca && (
            <Button variant="outline" size="sm" className="mt-4" onClick={abrirCriacao}>
              <Plus className="h-4 w-4" />
              Cadastrar a primeira base
            </Button>
          )}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Cidade/UF</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Status</TableHead>
              {(podeEditar || podeExcluir) && <TableHead className="text-right">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtradas.map((b) => (
              <TableRow key={b.id}>
                <TableCell className="font-medium text-slate-800">{b.nome}</TableCell>
                <TableCell>{b.cidade ? `${b.cidade}${b.estado ? `/${b.estado}` : ""}` : "—"}</TableCell>
                <TableCell>{b.responsavel || "—"}</TableCell>
                <TableCell>{b.telefone || "—"}</TableCell>
                <TableCell>
                  <Badge variant={b.status === "inativo" ? "neutral" : "success"}>
                    {b.status === "inativo" ? "Inativo" : "Ativo"}
                  </Badge>
                </TableCell>
                {(podeEditar || podeExcluir) && (
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      {podeEditar && (
                        <Button variant="ghost" size="icon" onClick={() => { setEmEdicao(b); setFormAberto(true); }} aria-label={`Editar ${b.nome}`}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      {podeExcluir && (
                        <Button variant="ghost" size="icon" onClick={() => setParaExcluir(b)} aria-label={`Excluir ${b.nome}`} className="hover:text-danger">
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

      <BaseFormDialog aberto={formAberto} onFechar={() => setFormAberto(false)} base={emEdicao} onSalvar={handleSalvar} salvando={criar.isPending || atualizar.isPending} />

      <ConfirmarExclusaoDialog
        aberto={!!paraExcluir}
        onFechar={() => setParaExcluir(null)}
        onConfirmar={handleExcluir}
        titulo="Excluir base"
        descricao={`Tem certeza que deseja excluir "${paraExcluir?.nome}"? Colaboradores já vinculados a ela manterão o nome salvo, mas ela deixará de aparecer na lista de seleção.`}
        excluindo={excluir.isPending}
      />
    </div>
  );
}
