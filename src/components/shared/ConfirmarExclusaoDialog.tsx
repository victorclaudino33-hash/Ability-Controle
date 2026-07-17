import { AlertTriangle } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmarExclusaoDialogProps {
  aberto: boolean;
  onFechar: () => void;
  onConfirmar: () => void;
  titulo: string;
  descricao: string;
  excluindo?: boolean;
}

export function ConfirmarExclusaoDialog({
  aberto,
  onFechar,
  onConfirmar,
  titulo,
  descricao,
  excluindo,
}: ConfirmarExclusaoDialogProps) {
  return (
    <Dialog aberto={aberto} onFechar={onFechar} titulo={titulo} largura="sm">
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger-light">
          <AlertTriangle className="h-5 w-5 text-danger" />
        </div>
        <p className="text-sm text-slate-600">{descricao}</p>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="ghost" onClick={onFechar}>
          Cancelar
        </Button>
        <Button variant="destructive" onClick={onConfirmar} loading={excluindo}>
          Excluir
        </Button>
      </div>
    </Dialog>
  );
}
