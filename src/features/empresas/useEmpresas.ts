import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listarEmpresas,
  criarEmpresa,
  atualizarEmpresa,
  excluirEmpresa,
  criarEmpresaRapida,
} from "./empresaService";
import type { EmpresaInput } from "@/types/empresaBase";

const CHAVE = ["empresas"];

export function useEmpresasQuery() {
  return useQuery({ queryKey: CHAVE, queryFn: listarEmpresas });
}

export function useCriarEmpresa() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: EmpresaInput) => criarEmpresa(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CHAVE }),
  });
}

export function useAtualizarEmpresa() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: EmpresaInput }) => atualizarEmpresa(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CHAVE }),
  });
}

export function useExcluirEmpresa() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => excluirEmpresa(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CHAVE }),
  });
}

export function useCriarEmpresaRapida() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (nome: string) => criarEmpresaRapida(nome),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CHAVE }),
  });
}
