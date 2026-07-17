import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogProps {
  aberto: boolean;
  onFechar: () => void;
  titulo: string;
  descricao?: string;
  children: React.ReactNode;
  largura?: "sm" | "md" | "lg";
}

const larguras = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

export function Dialog({ aberto, onFechar, titulo, descricao, children, largura = "md" }: DialogProps) {
  React.useEffect(() => {
    if (!aberto) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onFechar();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [aberto, onFechar]);

  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-900/50"
        onClick={onFechar}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-titulo"
        className={cn(
          "relative z-10 max-h-[90vh] w-full overflow-y-auto rounded-[var(--radius-lg)] bg-white shadow-xl",
          larguras[largura]
        )}
      >
        <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 id="dialog-titulo" className="font-display text-base font-semibold text-slate-800">
              {titulo}
            </h2>
            {descricao && <p className="mt-0.5 text-sm text-slate-500">{descricao}</p>}
          </div>
          <button
            onClick={onFechar}
            className="text-slate-400 hover:text-slate-600"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
