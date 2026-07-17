import { useQuery } from "@tanstack/react-query";
import { listarHistorico } from "./historicoService";

export function useHistoricoQuery() {
  return useQuery({ queryKey: ["historico"], queryFn: listarHistorico });
}
