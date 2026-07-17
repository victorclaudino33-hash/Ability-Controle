import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listarClinicas, criarClinica, atualizarClinica, excluirClinica } from "./clinicaService";
import type { ClinicaInput } from "@/types/clinica";

const CHAVE = ["clinicas"];

export function useClinicasQuery() {
  return useQuery({ queryKey: CHAVE, queryFn: listarClinicas });
}

export function useCriarClinica() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ClinicaInput) => criarClinica(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CHAVE }),
  });
}

export function useAtualizarClinica() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ClinicaInput }) => atualizarClinica(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CHAVE }),
  });
}

export function useExcluirClinica() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => excluirClinica(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CHAVE }),
  });
}
