import { useState } from "react";
import { Plus, Pencil, Trash2, Tag, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ConfirmarExclusaoDialog } from "@/components/shared/ConfirmarExclusaoDialog";
import { useAuth } from "@/contexts/AuthContext";
import { podeExecutarAcao } from "@/config/permissions";
import { useTiposExameQuery, useCriarTipoExame, useAtualizarTipoExame, useExcluirTipoExame } from "./useTiposExame";
import { TipoExameFormDialog } from "./TipoExameFormDialog";
import type { TipoExame } from "@/types/tipoExame";

export function ConfiguracoesPage() {
  const { usuario } = useAuth();
  const perfil = usuario!.perfil;

  const podeCriar = podeExecutarAcao(perfil, "configuracoes", "criar");
  const podeEditar = podeExecutarAcao(perfil, "configuracoes", "editar");
  const podeExcluir = podeExecutarAcao(perfil, "configuracoes", "excluir");

  const { data: tipos, isLoading } = useTiposExameQuery();
  const criar = useCriarTipoExame();
  const atualizar = useAtualizarTipoExame();
  const excluir = useExcluirTipoExame();

  const [formAberto, setFormAberto] = useState(false);
  const [emEdicao, setEmEdicao] = useState<TipoExame | null>(null);
  const [paraExcluir, setParaExcluir] = useState<TipoExame | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  function abrirCriacao() {
    setEmEdicao(null);
    setFormAberto(true);
  }

  async function handleSalvar(nome: string) {
    setErro(null);
    if (emEdicao) {
      await atualizar.mutateAsync({ id: emEdicao.id, nome, usuario: usuario! });
    } else {
      await criar.mutateAsync({ nome, usuario: usuario! });
    }
    setFormAberto(false);
  }

  async function handleExcluir() {
    if (!paraExcluir) return;
    setErro(null);
    try {
      await excluir.mutateAsync({ tipo: paraExcluir, usuario: usuario! });
      setParaExcluir(null);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível excluir este tipo de exame.");
      setParaExcluir(null);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-display text-xl font-bold text-slate-800">Configurações</h2>
        <p className="text-sm text-slate-500">Gerencie os cadastros de apoio usados pelo sistema.</p>
      </div>

      {erro && (
        <div className="flex items-start gap-2 rounded-[var(--radius-lg)] border border-danger/20 bg-danger-light px-4 py-3 text-sm text-danger">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="flex-1">{erro}</p>
          <button onClick={() => setErro(null)} className="text-danger/70 hover:text-danger" aria-label="Fechar aviso">
            ×
          </button>
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle>Tipos de exame</CardTitle>
            <CardDescription>Usados no cadastro de exames e nas planilhas de importação em massa.</CardDescription>
          </div>
          {podeCriar && (
            <Button size="sm" onClick={abrirCriacao}>
              <Plus className="h-4 w-4" />
              Novo tipo
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-10 text-center text-sm text-slate-400">Carregando...</div>
          ) : !tipos || tipos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Tag className="h-8 w-8 text-slate-300" />
              <p className="mt-3 text-sm font-medium text-slate-600">Nenhum tipo de exame cadastrado ainda.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Origem</TableHead>
                  {(podeEditar || podeExcluir) && <TableHead className="text-right">Ações</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {tipos.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium text-slate-800">{t.nome}</TableCell>
                    <TableCell>
                      <Badge variant={t.padrao ? "info" : "neutral"}>{t.padrao ? "Padrão do sistema" : "Personalizado"}</Badge>
                    </TableCell>
                    {(podeEditar || podeExcluir) && (
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          {podeEditar && (
                            <Button variant="ghost" size="icon" onClick={() => { setEmEdicao(t); setFormAberto(true); }} aria-label={`Renomear ${t.nome}`}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}
                          {podeExcluir && (
                            <Button variant="ghost" size="icon" onClick={() => setParaExcluir(t)} aria-label={`Excluir ${t.nome}`} className="hover:text-danger">
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
        </CardContent>
      </Card>

      <TipoExameFormDialog
        aberto={formAberto}
        onFechar={() => setFormAberto(false)}
        tipo={emEdicao}
        onSalvar={handleSalvar}
        salvando={criar.isPending || atualizar.isPending}
      />

      <ConfirmarExclusaoDialog
        aberto={!!paraExcluir}
        onFechar={() => setParaExcluir(null)}
        onConfirmar={handleExcluir}
        titulo="Excluir tipo de exame"
        descricao={`Tem certeza que deseja excluir "${paraExcluir?.nome}"? Só é possível excluir tipos que não estejam em uso por nenhum exame.`}
        excluindo={excluir.isPending}
      />
    </div>
  );
}
