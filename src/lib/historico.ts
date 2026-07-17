import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/config/firebase";
import { COLLECTIONS } from "@/config/collections";
import type { RegistroHistoricoInput } from "@/types/historico";

/**
 * Registra uma entrada de histórico/auditoria.
 * Usado por todos os módulos que criam, editam ou excluem registros importantes
 * (a listagem completa por colaborador/exame será exibida no módulo Histórico).
 */
export async function registrarHistorico(input: RegistroHistoricoInput): Promise<void> {
  await addDoc(collection(db, COLLECTIONS.HISTORICO), {
    ...input,
    criadoEm: serverTimestamp(),
  });
}
