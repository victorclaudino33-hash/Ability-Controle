import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listarBases,
  criarBase,
  atualizarBase,
  excluirBase,
  criarBaseRapida,
} from "./baseService";
import type { BaseInput } from "@/types/empresaBase";

const CHAVE = ["bases"];

export function useBasesQuery() {
  return useQuery({ queryKey: CHAVE, queryFn: listarBases });
}

export function useCriarBase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: BaseInput) => criarBase(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CHAVE }),
  });
}

export function useAtualizarBase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: BaseInput }) => atualizarBase(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CHAVE }),
  });
}

export function useExcluirBase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => excluirBase(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CHAVE }),
  });
}

export function useCriarBaseRapida() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (nome: string) => criarBaseRapida(nome),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CHAVE }),
  });
}
