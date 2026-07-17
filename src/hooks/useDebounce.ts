import { useEffect, useState } from "react";

export function useDebounce<T>(valor: T, atrasoMs = 300): T {
  const [valorDebounced, setValorDebounced] = useState(valor);

  useEffect(() => {
    const timeout = setTimeout(() => setValorDebounced(valor), atrasoMs);
    return () => clearTimeout(timeout);
  }, [valor, atrasoMs]);

  return valorDebounced;
}
