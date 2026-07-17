import { useMutation, useQueryClient } from "@tanstack/react-query";
import { importarColaboradores } from "./importarColaboradores";
import { importarExames } from "./importarExames";
import type { LinhaPlanilha } from "@/types/importacao";
import type { Usuario } from "@/types/auth";

export function useImportarColaboradores() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ linhas, usuario }: { linhas: LinhaPlanilha[]; usuario: Usuario }) =>
      importarColaboradores(linhas, usuario),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["colaboradores"] });
      queryClient.invalidateQueries({ queryKey: ["empresas"] });
      queryClient.invalidateQueries({ queryKey: ["bases"] });
    },
  });
}

export function useImportarExames() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ linhas, usuario }: { linhas: LinhaPlanilha[]; usuario: Usuario }) =>
      importarExames(linhas, usuario),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exames"] });
      queryClient.invalidateQueries({ queryKey: ["tiposExame"] });
    },
  });
}
