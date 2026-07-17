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
import type { Empresa, EmpresaInput } from "@/types/empresaBase";

export async function listarEmpresas(): Promise<Empresa[]> {
  const q = query(collection(db, COLLECTIONS.EMPRESAS), orderBy("nome"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Empresa, "id">) }));
}

export async function criarEmpresa(input: EmpresaInput): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTIONS.EMPRESAS), {
    ...input,
    criadoEm: serverTimestamp(),
    atualizadoEm: serverTimestamp(),
  });
  return ref.id;
}

export async function atualizarEmpresa(id: string, input: EmpresaInput): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.EMPRESAS, id), {
    ...input,
    atualizadoEm: serverTimestamp(),
  });
}

export async function excluirEmpresa(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.EMPRESAS, id));
}

/** Criação rápida (só nome) usada no cadastro inline de Colaboradores */
export async function criarEmpresaRapida(nome: string): Promise<Empresa> {
  const ref = await addDoc(collection(db, COLLECTIONS.EMPRESAS), {
    nome,
    status: "ativo",
    criadoEm: serverTimestamp(),
    atualizadoEm: serverTimestamp(),
  });
  return { id: ref.id, nome, status: "ativo", criadoEm: new Date().toISOString() };
}
