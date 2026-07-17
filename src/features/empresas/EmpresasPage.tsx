import { useMemo, useState } from "react";
import { Plus, Search, Pencil, Trash2, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ConfirmarExclusaoDialog } from "@/components/shared/ConfirmarExclusaoDialog";
import { useAuth } from "@/contexts/AuthContext";
import { podeExecutarAcao } from "@/config/permissions";
import { useDebounce } from "@/hooks/useDebounce";
import { formatarCNPJ } from "@/lib/cnpj";
import { useEmpresasQuery, useCriarEmpresa, useAtualizarEmpresa, useExcluirEmpresa } from "./useEmpresas";
import { EmpresaFormDialog } from "./EmpresaFormDialog";
import type { Empresa, EmpresaInput } from "@/types/empresaBase";

export function EmpresasPage() {
  const { usuario } = useAuth();
  const perfil = usuario!.perfil;

  const podeCriar = podeExecutarAcao(perfil, "empresas", "criar");
  const podeEditar = podeExecutarAcao(perfil, "empresas", "editar");
  const podeExcluir = podeExecutarAcao(perfil, "empresas", "excluir");

  const { data: empresas, isLoading } = useEmpresasQuery();
  const criar = useCriarEmpresa();
  const atualizar = useAtualizarEmpresa();
  const excluir = useExcluirEmpresa();

  const [busca, setBusca] = useState("");
  const buscaDebounced = useDebounce(busca, 250);
  const [formAberto, setFormAberto] = useState(false);
  const [emEdicao, setEmEdicao] = useState<Empresa | null>(null);
  const [paraExcluir, setParaExcluir] = useState<Empresa | null>(null);

  const filtradas = useMemo(() => {
    if (!empresas) return [];
    const termo = buscaDebounced.trim().toLowerCase();
    if (!termo) return empresas;
    return empresas.filter(
      (e) =>
        e.nome.toLowerCase().includes(termo) ||
        (e.cidade ?? "").toLowerCase().includes(termo) ||
        (e.cnpj ?? "").includes(termo.replace(/\D/g, ""))
    );
  }, [empresas, buscaDebounced]);

  function abrirCriacao() {
    setEmEdicao(null);
    setFormAberto(true);
  }

  async function handleSalvar(input: EmpresaInput) {
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
          <h2 className="font-display text-xl font-bold text-slate-800">Empresas</h2>
          <p className="text-sm text-slate-500">
            {empresas ? `${empresas.length} empresa(s) cadastrada(s)` : "Carregando..."}
          </p>
        </div>
        {podeCriar && (
          <Button onClick={abrirCriacao}>
            <Plus className="h-4 w-4" />
            Nova empresa
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
          <Briefcase className="h-8 w-8 text-slate-300" />
          <p className="mt-3 text-sm font-medium text-slate-600">
            {busca ? "Nenhuma empresa encontrada." : "Nenhuma empresa cadastrada ainda."}
          </p>
          {podeCriar && !busca && (
            <Button variant="outline" size="sm" className="mt-4" onClick={abrirCriacao}>
              <Plus className="h-4 w-4" />
              Cadastrar a primeira empresa
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
              <TableHead>Status</TableHead>
              {(podeEditar || podeExcluir) && <TableHead className="text-right">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtradas.map((e) => (
              <TableRow key={e.id}>
                <TableCell className="font-medium text-slate-800">{e.nome}</TableCell>
                <TableCell>{e.cnpj ? formatarCNPJ(e.cnpj) : "—"}</TableCell>
                <TableCell>{e.responsavel || "—"}</TableCell>
                <TableCell>{e.cidade ? `${e.cidade}${e.estado ? `/${e.estado}` : ""}` : "—"}</TableCell>
                <TableCell>
                  <Badge variant={e.status === "inativo" ? "neutral" : "success"}>
                    {e.status === "inativo" ? "Inativo" : "Ativo"}
                  </Badge>
                </TableCell>
                {(podeEditar || podeExcluir) && (
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      {podeEditar && (
                        <Button variant="ghost" size="icon" onClick={() => { setEmEdicao(e); setFormAberto(true); }} aria-label={`Editar ${e.nome}`}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      {podeExcluir && (
                        <Button variant="ghost" size="icon" onClick={() => setParaExcluir(e)} aria-label={`Excluir ${e.nome}`} className="hover:text-danger">
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

      <EmpresaFormDialog aberto={formAberto} onFechar={() => setFormAberto(false)} empresa={emEdicao} onSalvar={handleSalvar} salvando={criar.isPending || atualizar.isPending} />

      <ConfirmarExclusaoDialog
        aberto={!!paraExcluir}
        onFechar={() => setParaExcluir(null)}
        onConfirmar={handleExcluir}
        titulo="Excluir empresa"
        descricao={`Tem certeza que deseja excluir "${paraExcluir?.nome}"? Colaboradores já vinculados a ela manterão o nome salvo, mas ela deixará de aparecer na lista de seleção.`}
        excluindo={excluir.isPending}
      />
    </div>
  );
}
