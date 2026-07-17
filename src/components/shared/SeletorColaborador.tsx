import { useMemo, useRef, useState, useEffect } from "react";
import { Search, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { formatarCPF } from "@/lib/cpf";
import type { Colaborador } from "@/types/colaborador";

interface SeletorColaboradorProps {
  colaboradores: Colaborador[] | undefined;
  carregando: boolean;
  value: string;
  onChange: (id: string, colaborador: Colaborador | undefined) => void;
  hasError?: boolean;
}

export function SeletorColaborador({ colaboradores, carregando, value, onChange, hasError }: SeletorColaboradorProps) {
  const [aberto, setAberto] = useState(false);
  const [termo, setTermo] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selecionado = colaboradores?.find((c) => c.id === value);

  const filtrados = useMemo(() => {
    if (!colaboradores) return [];
    const t = termo.trim().toLowerCase();
    if (!t) return colaboradores.slice(0, 50);
    return colaboradores
      .filter((c) => c.nome.toLowerCase().includes(t) || c.cpf.includes(t.replace(/\D/g, "")))
      .slice(0, 50);
  }, [colaboradores, termo]);

  useEffect(() => {
    function handleClickFora(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setAberto(false);
      }
    }
    document.addEventListener("mousedown", handleClickFora);
    return () => document.removeEventListener("mousedown", handleClickFora);
  }, []);

  return (
    <div className="flex flex-col gap-1.5" ref={containerRef}>
      <Label>Colaborador</Label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setAberto((v) => !v)}
          disabled={carregando}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-[var(--radius-sm)] border bg-white px-3 text-sm transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ability-red/30 focus-visible:border-ability-red",
            hasError ? "border-danger" : "border-slate-300"
          )}
        >
          <span className={cn(selecionado ? "text-slate-800" : "text-slate-400")}>
            {carregando ? "Carregando..." : selecionado ? selecionado.nome : "Selecione o colaborador"}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
        </button>

        {aberto && (
          <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-[var(--radius-md)] border border-slate-200 bg-white shadow-lg">
            <div className="flex items-center gap-2 border-b border-slate-200 px-3 py-2">
              <Search className="h-4 w-4 shrink-0 text-slate-400" />
              <input
                autoFocus
                value={termo}
                onChange={(e) => setTermo(e.target.value)}
                placeholder="Buscar por nome ou CPF..."
                className="w-full text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
            <div className="scrollbar-thin max-h-56 overflow-y-auto">
              {filtrados.length === 0 ? (
                <p className="px-3 py-4 text-center text-sm text-slate-400">Nenhum colaborador encontrado.</p>
              ) : (
                filtrados.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      onChange(c.id, c);
                      setAberto(false);
                      setTermo("");
                    }}
                    className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-slate-50"
                  >
                    <span>
                      <span className="block text-slate-800">{c.nome}</span>
                      <span className="block text-xs text-slate-400">{formatarCPF(c.cpf)} · {c.empresaNome}</span>
                    </span>
                    {c.id === value && <Check className="h-4 w-4 shrink-0 text-ability-red" />}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
