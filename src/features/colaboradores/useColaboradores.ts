import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listarColaboradores,
  criarColaborador,
  atualizarColaborador,
  excluirColaborador,
} from "./colaboradorService";
import type { ColaboradorInput } from "@/types/colaborador";

const CHAVE = ["colaboradores"];

export function useColaboradoresQuery() {
  return useQuery({ queryKey: CHAVE, queryFn: listarColaboradores });
}

export function useCriarColaborador() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ColaboradorInput) => criarColaborador(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CHAVE }),
  });
}

export function useAtualizarColaborador() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ColaboradorInput }) =>
      atualizarColaborador(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CHAVE }),
  });
}

export function useExcluirColaborador() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => excluirColaborador(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CHAVE }),
  });
}
