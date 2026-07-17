import { useMemo, useState } from "react";
import { Plus, Search, Pencil, Trash2, UserCog, KeyRound, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ConfirmarExclusaoDialog } from "@/components/shared/ConfirmarExclusaoDialog";
import { useAuth } from "@/contexts/AuthContext";
import { podeExecutarAcao } from "@/config/permissions";
import { useDebounce } from "@/hooks/useDebounce";
import { PERFIL_LABEL, PERFIL_BADGE_VARIANT } from "@/config/perfilLabels";
import { useBasesQuery } from "@/features/bases/useBases";
import {
  useUsuariosQuery,
  useCriarUsuario,
  useAtualizarUsuario,
  useExcluirUsuario,
  useReenviarRedefinicaoSenha,
} from "./useUsuarios";
import { UsuarioFormDialog } from "./UsuarioFormDialog";
import type { UsuarioInput, CriarUsuarioInput } from "./usuarioService";
import type { Usuario, Perfil, StatusUsuario } from "@/types/auth";

export function UsuariosPage() {
  const { usuario: adminLogado } = useAuth();
  const perfilLogado = adminLogado!.perfil;

  const podeCriar = podeExecutarAcao(perfilLogado, "usuarios", "criar");
  const podeEditar = podeExecutarAcao(perfilLogado, "usuarios", "editar");
  const podeExcluir = podeExecutarAcao(perfilLogado, "usuarios", "excluir");

  const { data: usuarios, isLoading } = useUsuariosQuery();
  const { data: bases } = useBasesQuery();
  const criar = useCriarUsuario();
  const atualizar = useAtualizarUsuario();
  const excluir = useExcluirUsuario();
  const reenviarSenha = useReenviarRedefinicaoSenha();

  const [busca, setBusca] = useState("");
  const buscaDebounced = useDebounce(busca, 250);
  const [filtroPerfil, setFiltroPerfil] = useState<Perfil | "">("");
  const [filtroStatus, setFiltroStatus] = useState<StatusUsuario | "">("");

  const [formAberto, setFormAberto] = useState(false);
  const [emEdicao, setEmEdicao] = useState<Usuario | null>(null);
  const [paraExcluir, setParaExcluir] = useState<Usuario | null>(null);
  const [mensagem, setMensagem] = useState<string | null>(null);

  const mapaBases = useMemo(() => new Map((bases ?? []).map((b) => [b.id, b.nome])), [bases]);

  const filtrados = useMemo(() => {
    if (!usuarios) return [];
    const termo = buscaDebounced.trim().toLowerCase();

    return usuarios.filter((u) => {
      const bateBusca =
        !termo || u.nome.toLowerCase().includes(termo) || u.email.toLowerCase().includes(termo);
      const batePerfil = !filtroPerfil || u.perfil === filtroPerfil;
      const bateStatus = !filtroStatus || u.status === filtroStatus;
      return bateBusca && batePerfil && bateStatus;
    });
  }, [usuarios, buscaDebounced, filtroPerfil, filtroStatus]);

  function abrirCriacao() {
    setEmEdicao(null);
    setFormAberto(true);
  }

  async function handleSalvar(input: UsuarioInput | CriarUsuarioInput) {
    if (emEdicao) {
      await atualizar.mutateAsync({ uid: emEdicao.uid, input, adminLogado: adminLogado! });
      setMensagem(`Usuário "${input.nome}" atualizado.`);
    } else {
      await criar.mutateAsync({ input: input as CriarUsuarioInput, adminLogado: adminLogado! });
      setMensagem(`Usuário "${input.nome}" cadastrado com sucesso. Repasse a senha definida ao usuário por um canal seguro.`);
    }
    setFormAberto(false);
  }

  async function handleExcluir() {
    if (!paraExcluir) return;
    await excluir.mutateAsync({ usuario: paraExcluir, adminLogado: adminLogado! });
    setMensagem(`Acesso de "${paraExcluir.nome}" foi removido.`);
    setParaExcluir(null);
  }

  async function handleReenviarSenha(u: Usuario) {
    await reenviarSenha.mutateAsync(u.email);
    setMensagem(`E-mail de redefinição de senha reenviado para ${u.email}.`);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-slate-800">Usuários</h2>
          <p className="text-sm text-slate-500">{usuarios ? `${usuarios.length} usuário(s) cadastrado(s)` : "Carregando..."}</p>
        </div>
        {podeCriar && (
          <Button onClick={abrirCriacao}>
            <Plus className="h-4 w-4" />
            Novo usuário
          </Button>
        )}
      </div>

      {mensagem && (
        <div className="flex items-start gap-2 rounded-[var(--radius-lg)] border border-success/20 bg-success-light px-4 py-3 text-sm text-success">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <p className="flex-1">{mensagem}</p>
          <button onClick={() => setMensagem(null)} className="text-success/70 hover:text-success" aria-label="Fechar aviso">
            ×
          </button>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Pesquisar por nome ou e-mail..." className="pl-9" />
        </div>
        <Select value={filtroPerfil} onChange={(e) => setFiltroPerfil(e.target.value as Perfil | "")} className="sm:w-52">
          <option value="">Todos os perfis</option>
          {(Object.keys(PERFIL_LABEL) as Perfil[]).map((p) => (
            <option key={p} value={p}>{PERFIL_LABEL[p]}</option>
          ))}
        </Select>
        <Select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value as StatusUsuario | "")} className="sm:w-44">
          <option value="">Todos os status</option>
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
        </Select>
      </div>

      {isLoading ? (
        <div className="rounded-[var(--radius-lg)] border border-slate-200 bg-white py-20 text-center text-sm text-slate-400">Carregando...</div>
      ) : filtrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-slate-300 bg-white py-20 text-center">
          <UserCog className="h-8 w-8 text-slate-300" />
          <p className="mt-3 text-sm font-medium text-slate-600">
            {busca || filtroPerfil || filtroStatus ? "Nenhum usuário encontrado para esse filtro." : "Nenhum usuário cadastrado ainda."}
          </p>
          {podeCriar && !busca && !filtroPerfil && !filtroStatus && (
            <Button variant="outline" size="sm" className="mt-4" onClick={abrirCriacao}>
              <Plus className="h-4 w-4" />
              Cadastrar o primeiro usuário
            </Button>
          )}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Perfil</TableHead>
              <TableHead>Base</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtrados.map((u) => {
              const ehProprioUsuario = u.uid === adminLogado!.uid;
              return (
                <TableRow key={u.uid}>
                  <TableCell className="font-medium text-slate-800">
                    {u.nome}
                    {ehProprioUsuario && <span className="ml-1.5 text-xs text-slate-400">(você)</span>}
                  </TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Badge variant={PERFIL_BADGE_VARIANT[u.perfil]}>{PERFIL_LABEL[u.perfil]}</Badge>
                  </TableCell>
                  <TableCell>{u.baseId ? mapaBases.get(u.baseId) ?? "—" : "Todas"}</TableCell>
                  <TableCell>
                    <Badge variant={u.status === "ativo" ? "success" : "neutral"}>
                      {u.status === "ativo" ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleReenviarSenha(u)}
                        aria-label={`Reenviar e-mail de redefinição de senha para ${u.nome}`}
                        title="Reenviar e-mail de redefinição de senha"
                      >
                        <KeyRound className="h-4 w-4" />
                      </Button>
                      {podeEditar && (
                        <Button variant="ghost" size="icon" onClick={() => { setEmEdicao(u); setFormAberto(true); }} aria-label={`Editar usuário ${u.nome}`}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      {podeExcluir && !ehProprioUsuario && (
                        <Button variant="ghost" size="icon" onClick={() => setParaExcluir(u)} aria-label={`Excluir usuário ${u.nome}`} className="hover:text-danger">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      <UsuarioFormDialog
        aberto={formAberto}
        onFechar={() => setFormAberto(false)}
        usuario={emEdicao}
        onSalvar={handleSalvar}
        salvando={criar.isPending || atualizar.isPending}
        ehProprioUsuario={emEdicao?.uid === adminLogado!.uid}
      />

      <ConfirmarExclusaoDialog
        aberto={!!paraExcluir}
        onFechar={() => setParaExcluir(null)}
        onConfirmar={handleExcluir}
        titulo="Remover acesso do usuário"
        descricao={`Tem certeza que deseja remover o acesso de "${paraExcluir?.nome}"? A conta perde o acesso ao sistema imediatamente. Essa ação não pode ser desfeita por aqui.`}
        excluindo={excluir.isPending}
      />
    </div>
  );
}
