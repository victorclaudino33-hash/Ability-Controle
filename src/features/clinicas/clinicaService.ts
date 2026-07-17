import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import { COLLECTIONS } from "@/config/collections";
import type { Clinica, ClinicaInput } from "@/types/clinica";

export async function listarClinicas(): Promise<Clinica[]> {
  const q = query(collection(db, COLLECTIONS.CLINICAS), orderBy("nome"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Clinica, "id">) }));
}

export async function criarClinica(input: ClinicaInput): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTIONS.CLINICAS), {
    ...input,
    criadoEm: serverTimestamp(),
    atualizadoEm: serverTimestamp(),
  });
  return ref.id;
}

export async function atualizarClinica(id: string, input: ClinicaInput): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.CLINICAS, id), {
    ...input,
    atualizadoEm: serverTimestamp(),
  });
}

export async function excluirClinica(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.CLINICAS, id));
}
