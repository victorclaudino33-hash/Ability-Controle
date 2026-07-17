import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listarExames, criarExame, atualizarExame, excluirExame } from "./exameService";
import type { Exame, ExameInput } from "@/types/exame";
import type { Usuario } from "@/types/auth";

const CHAVE = ["exames"];

export function useExamesQuery() {
  return useQuery({ queryKey: CHAVE, queryFn: listarExames });
}

export function useCriarExame() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ input, usuario }: { input: ExameInput; usuario: Usuario }) => criarExame(input, usuario),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CHAVE }),
  });
}

export function useAtualizarExame() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input, usuario }: { id: string; input: ExameInput; usuario: Usuario }) =>
      atualizarExame(id, input, usuario),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CHAVE }),
  });
}

export function useExcluirExame() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ exame, usuario }: { exame: Exame; usuario: Usuario }) => excluirExame(exame, usuario),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CHAVE }),
  });
}
