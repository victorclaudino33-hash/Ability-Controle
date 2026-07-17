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
import { registrarHistorico } from "@/lib/historico";
import type { Exame, ExameInput } from "@/types/exame";
import type { Usuario } from "@/types/auth";

export async function listarExames(): Promise<Exame[]> {
  const q = query(collection(db, COLLECTIONS.EXAMES), orderBy("data", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Exame, "id">) }));
}

export async function criarExame(input: ExameInput, usuario: Usuario): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTIONS.EXAMES), {
    ...input,
    criadoEm: serverTimestamp(),
    atualizadoEm: serverTimestamp(),
  });

  await registrarHistorico({
    entidade: "exame",
    entidadeId: ref.id,
    acao: "criacao",
    descricao: `Exame de ${input.tipoNome} cadastrado para ${input.colaboradorNome}.`,
    colaboradorId: input.colaboradorId,
    usuarioUid: usuario.uid,
    usuarioNome: usuario.nome,
  });

  return ref.id;
}

export async function atualizarExame(id: string, input: ExameInput, usuario: Usuario): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.EXAMES, id), {
    ...input,
    atualizadoEm: serverTimestamp(),
  });

  await registrarHistorico({
    entidade: "exame",
    entidadeId: id,
    acao: "edicao",
    descricao: `Exame de ${input.tipoNome} de ${input.colaboradorNome} foi atualizado.`,
    colaboradorId: input.colaboradorId,
    usuarioUid: usuario.uid,
    usuarioNome: usuario.nome,
  });
}

export async function excluirExame(exame: Exame, usuario: Usuario): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.EXAMES, exame.id));

  await registrarHistorico({
    entidade: "exame",
    entidadeId: exame.id,
    acao: "exclusao",
    descricao: `Exame de ${exame.tipoNome} de ${exame.colaboradorNome} foi excluído.`,
    colaboradorId: exame.colaboradorId,
    usuarioUid: usuario.uid,
    usuarioNome: usuario.nome,
  });
}
