import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listarTiposExame,
  criarTipoExameRapido,
  criarTipoExame,
  atualizarTipoExame,
  excluirTipoExame,
} from "./tipoExameService";
import type { TipoExame } from "@/types/tipoExame";
import type { Usuario } from "@/types/auth";

const CHAVE = ["tiposExame"];

export function useTiposExameQuery() {
  return useQuery({ queryKey: CHAVE, queryFn: listarTiposExame });
}

/** Criação rápida (sem histórico) usada no cadastro inline dentro do formulário de Exames. */
export function useCriarTipoExameRapido() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (nome: string) => criarTipoExameRapido(nome),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CHAVE }),
  });
}

export function useCriarTipoExame() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ nome, usuario }: { nome: string; usuario: Usuario }) => criarTipoExame(nome, usuario),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CHAVE }),
  });
}

export function useAtualizarTipoExame() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, nome, usuario }: { id: string; nome: string; usuario: Usuario }) =>
      atualizarTipoExame(id, nome, usuario),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CHAVE }),
  });
}

export function useExcluirTipoExame() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tipo, usuario }: { tipo: TipoExame; usuario: Usuario }) => excluirTipoExame(tipo, usuario),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CHAVE }),
  });
}
