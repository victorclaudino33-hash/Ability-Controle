import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/config/firebase";
import { COLLECTIONS } from "@/config/collections";
import { limparCPF } from "@/lib/cpf";
import type { Colaborador, ColaboradorInput } from "@/types/colaborador";

/** Lista todos os colaboradores ordenados por nome. A pesquisa/filtro é feita no cliente (ColaboradoresPage). */
export async function listarColaboradores(): Promise<Colaborador[]> {
  const q = query(collection(db, COLLECTIONS.COLABORADORES), orderBy("nome"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Colaborador, "id">) }));
}

/** Verifica se já existe colaborador com este CPF (usado para evitar duplicidade no cadastro) */
export async function existeColaboradorComCPF(cpf: string, ignorarId?: string): Promise<boolean> {
  const q = query(collection(db, COLLECTIONS.COLABORADORES), where("cpf", "==", limparCPF(cpf)));
  const snap = await getDocs(q);
  return snap.docs.some((d) => d.id !== ignorarId);
}

export async function criarColaborador(input: ColaboradorInput): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTIONS.COLABORADORES), {
    ...input,
    cpf: limparCPF(input.cpf),
    criadoEm: serverTimestamp(),
    atualizadoEm: serverTimestamp(),
  });
  return ref.id;
}

export async function atualizarColaborador(id: string, input: ColaboradorInput): Promise<void> {
  const ref = doc(db, COLLECTIONS.COLABORADORES, id);
  await updateDoc(ref, {
    ...input,
    cpf: limparCPF(input.cpf),
    atualizadoEm: serverTimestamp(),
  });
}

export async function excluirColaborador(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.COLABORADORES, id));
}
