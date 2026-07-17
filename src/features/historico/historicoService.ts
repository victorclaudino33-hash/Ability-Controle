import { collection, getDocs, orderBy, query, limit, Timestamp } from "firebase/firestore";
import { db } from "@/config/firebase";
import { COLLECTIONS } from "@/config/collections";
import type { RegistroHistorico } from "@/types/historico";

/** Limite de registros carregados de uma vez — histórico só cresce, então paginamos pelos mais recentes. */
const LIMITE_REGISTROS = 500;

export async function listarHistorico(): Promise<RegistroHistorico[]> {
  const q = query(collection(db, COLLECTIONS.HISTORICO), orderBy("criadoEm", "desc"), limit(LIMITE_REGISTROS));
  const snap = await getDocs(q);

  return snap.docs.map((d) => {
    const dados = d.data();
    const criadoEm = dados.criadoEm instanceof Timestamp ? dados.criadoEm.toDate().toISOString() : new Date().toISOString();
    return {
      id: d.id,
      ...(dados as Omit<RegistroHistorico, "id" | "criadoEm">),
      criadoEm,
    };
  });
}
