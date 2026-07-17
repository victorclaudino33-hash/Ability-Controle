import { Loader2 } from "lucide-react";

export function FullscreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <Loader2 className="h-6 w-6 animate-spin text-ability-red" />
    </div>
  );
}
