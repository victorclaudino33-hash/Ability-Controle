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
import type { Base, BaseInput } from "@/types/empresaBase";

export async function listarBases(): Promise<Base[]> {
  const q = query(collection(db, COLLECTIONS.BASES), orderBy("nome"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Base, "id">) }));
}

export async function criarBase(input: BaseInput): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTIONS.BASES), {
    ...input,
    criadoEm: serverTimestamp(),
    atualizadoEm: serverTimestamp(),
  });
  return ref.id;
}

export async function atualizarBase(id: string, input: BaseInput): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.BASES, id), {
    ...input,
    atualizadoEm: serverTimestamp(),
  });
}

export async function excluirBase(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.BASES, id));
}

/** Criação rápida (só nome) usada no cadastro inline de Colaboradores */
export async function criarBaseRapida(nome: string): Promise<Base> {
  const ref = await addDoc(collection(db, COLLECTIONS.BASES), {
    nome,
    status: "ativo",
    criadoEm: serverTimestamp(),
    atualizadoEm: serverTimestamp(),
  });
  return { id: ref.id, nome, status: "ativo", criadoEm: new Date().toISOString() };
}
