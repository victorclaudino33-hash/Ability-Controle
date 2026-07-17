import { Construction } from "lucide-react";

export function EmConstrucao({ titulo }: { titulo: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-slate-300 bg-white py-24 text-center">
      <Construction className="h-8 w-8 text-slate-400" />
      <p className="mt-4 font-display text-base font-semibold text-slate-700">{titulo}</p>
      <p className="mt-1 text-sm text-slate-500">Este módulo será desenvolvido na próxima etapa.</p>
    </div>
  );
}
