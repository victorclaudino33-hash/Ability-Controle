import { useMemo, useState } from "react";
import { Plus, Search, Pencil, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { ConfirmarExclusaoDialog } from "@/components/shared/ConfirmarExclusaoDialog";
import { useAuth } from "@/contexts/AuthContext";
import { podeExecutarAcao } from "@/config/permissions";
import { useDebounce } from "@/hooks/useDebounce";
import { formatarCPF } from "@/lib/cpf";
import { formatarDataBR } from "@/lib/format";
import {
  useColaboradoresQuery,
  useCriarColaborador,
  useAtualizarColaborador,
  useExcluirColaborador,
} from "./useColaboradores";
import { ColaboradorFormDialog } from "./ColaboradorFormDialog";
import type { Colaborador, ColaboradorInput } from "@/types/colaborador";

export function ColaboradoresPage() {
  const { usuario } = useAuth();
  const perfil = usuario!.perfil;

  const podeCriar = podeExecutarAcao(perfil, "colaboradores", "criar");
  const podeEditar = podeExecutarAcao(perfil, "colaboradores", "editar");
  const podeExcluir = podeExecutarAcao(perfil, "colaboradores", "excluir");

  const { data: colaboradores, isLoading } = useColaboradoresQuery();
  const criar = useCriarColaborador();
  const atualizar = useAtualizarColaborador();
  const excluir = useExcluirColaborador();

  const [busca, setBusca] = useState("");
  const buscaDebounced = useDebounce(busca, 250);

  const [formAberto, setFormAberto] = useState(false);
  const [colaboradorEmEdicao, setColaboradorEmEdicao] = useState<Colaborador | null>(null);
  const [colaboradorParaExcluir, setColaboradorParaExcluir] = useState<Colaborador | null>(null);

  const colaboradoresFiltrados = useMemo(() => {
    if (!colaboradores) return [];
    const termo = buscaDebounced.trim().toLowerCase();
    if (!termo) return colaboradores;

    return colaboradores.filter((c) => {
      const cpfDigitos = c.cpf.replace(/\D/g, "");
      const termoDigitos = termo.replace(/\D/g, "");
      return (
        c.nome.toLowerCase().includes(termo) ||
        c.re.toLowerCase().includes(termo) ||
        c.empresaNome.toLowerCase().includes(termo) ||
        c.baseNome.toLowerCase().includes(termo) ||
        (termoDigitos.length > 0 && cpfDigitos.includes(termoDigitos))
      );
    });
  }, [colaboradores, buscaDebounced]);

  function abrirCriacao() {
    setColaboradorEmEdicao(null);
    setFormAberto(true);
  }

  function abrirEdicao(colaborador: Colaborador) {
    setColaboradorEmEdicao(colaborador);
    setFormAberto(true);
  }

  async function handleSalvar(input: ColaboradorInput) {
    if (colaboradorEmEdicao) {
      await atualizar.mutateAsync({ id: colaboradorEmEdicao.id, input });
    } else {
      await criar.mutateAsync(input);
    }
    setFormAberto(false);
  }

  async function handleConfirmarExclusao() {
    if (!colaboradorParaExcluir) return;
    await excluir.mutateAsync(colaboradorParaExcluir.id);
    setColaboradorParaExcluir(null);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-slate-800">Colaboradores</h2>
          <p className="text-sm text-slate-500">
            {colaboradores ? `${colaboradores.length} colaborador(es) cadastrado(s)` : "Carregando..."}
          </p>
        </div>
        {podeCriar && (
          <Button onClick={abrirCriacao}>
            <Plus className="h-4 w-4" />
            Novo colaborador
          </Button>
        )}
      </div>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Pesquisar por nome, CPF, RE, empresa ou base..."
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="rounded-[var(--radius-lg)] border border-slate-200 bg-white py-20 text-center text-sm text-slate-400">
          Carregando colaboradores...
        </div>
      ) : colaboradoresFiltrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-slate-300 bg-white py-20 text-center">
          <Users className="h-8 w-8 text-slate-300" />
          <p className="mt-3 text-sm font-medium text-slate-600">
            {busca ? "Nenhum colaborador encontrado para essa pesquisa." : "Nenhum colaborador cadastrado ainda."}
          </p>
          {podeCriar && !busca && (
            <Button variant="outline" size="sm" className="mt-4" onClick={abrirCriacao}>
              <Plus className="h-4 w-4" />
              Cadastrar o primeiro colaborador
            </Button>
          )}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>CPF</TableHead>
              <TableHead>RE</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Base</TableHead>
              <TableHead>Cargo</TableHead>
              <TableHead>Admissão</TableHead>
              <TableHead>Status</TableHead>
              {(podeEditar || podeExcluir) && <TableHead className="text-right">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {colaboradoresFiltrados.map((colaborador) => (
              <TableRow key={colaborador.id}>
                <TableCell className="font-medium text-slate-800">{colaborador.nome}</TableCell>
                <TableCell>{formatarCPF(colaborador.cpf)}</TableCell>
                <TableCell>{colaborador.re}</TableCell>
                <TableCell>{colaborador.empresaNome}</TableCell>
                <TableCell>{colaborador.baseNome}</TableCell>
                <TableCell>{colaborador.cargo}</TableCell>
                <TableCell>{formatarDataBR(colaborador.dataAdmissao)}</TableCell>
                <TableCell>
                  <Badge variant={colaborador.status === "ativo" ? "success" : "neutral"}>
                    {colaborador.status === "ativo" ? "Ativo" : "Inativo"}
                  </Badge>
                </TableCell>
                {(podeEditar || podeExcluir) && (
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      {podeEditar && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => abrirEdicao(colaborador)}
                          aria-label={`Editar ${colaborador.nome}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      {podeExcluir && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setColaboradorParaExcluir(colaborador)}
                          aria-label={`Excluir ${colaborador.nome}`}
                          className="hover:text-danger"
                        >
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

      <ColaboradorFormDialog
        aberto={formAberto}
        onFechar={() => setFormAberto(false)}
        colaborador={colaboradorEmEdicao}
        onSalvar={handleSalvar}
        salvando={criar.isPending || atualizar.isPending}
      />

      <ConfirmarExclusaoDialog
        aberto={!!colaboradorParaExcluir}
        onFechar={() => setColaboradorParaExcluir(null)}
        onConfirmar={handleConfirmarExclusao}
        titulo="Excluir colaborador"
        descricao={`Tem certeza que deseja excluir "${colaboradorParaExcluir?.nome}"? Essa ação não pode ser desfeita.`}
        excluindo={excluir.isPending}
      />
    </div>
  );
}
