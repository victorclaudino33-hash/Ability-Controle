import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  listarUsuarios,
  criarUsuario,
  atualizarUsuario,
  excluirUsuario,
  reenviarRedefinicaoSenha,
  type UsuarioInput,
  type CriarUsuarioInput,
} from "./usuarioService";
import type { Usuario } from "@/types/auth";

const CHAVE = ["usuarios"];

export function useUsuariosQuery() {
  return useQuery({ queryKey: CHAVE, queryFn: listarUsuarios });
}

export function useCriarUsuario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ input, adminLogado }: { input: CriarUsuarioInput; adminLogado: Usuario }) =>
      criarUsuario(input, adminLogado),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CHAVE }),
  });
}

export function useAtualizarUsuario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ uid, input, adminLogado }: { uid: string; input: UsuarioInput; adminLogado: Usuario }) =>
      atualizarUsuario(uid, input, adminLogado),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CHAVE }),
  });
}

export function useExcluirUsuario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ usuario, adminLogado }: { usuario: Usuario; adminLogado: Usuario }) =>
      excluirUsuario(usuario, adminLogado),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CHAVE }),
  });
}

export function useReenviarRedefinicaoSenha() {
  return useMutation({
    mutationFn: (email: string) => reenviarRedefinicaoSenha(email),
  });
}
