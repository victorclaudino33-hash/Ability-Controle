import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  orderBy,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";
import { auth, authSecundario, db } from "@/config/firebase";
import { COLLECTIONS } from "@/config/collections";
import { registrarHistorico } from "@/lib/historico";
import type { Usuario } from "@/types/auth";

export type UsuarioInput = Omit<Usuario, "uid" | "criadoEm" | "atualizadoEm">;

/** Dados para criação de usuário: os campos de perfil + a senha de acesso definida pelo admin. */
export type CriarUsuarioInput = UsuarioInput & { senha: string };

export async function listarUsuarios(): Promise<Usuario[]> {
  const q = query(collection(db, COLLECTIONS.USUARIOS), orderBy("nome"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ uid: d.id, ...(d.data() as Omit<Usuario, "uid">) }));
}

export async function existeUsuarioComEmail(email: string): Promise<boolean> {
  const q = query(collection(db, COLLECTIONS.USUARIOS), where("email", "==", email.trim().toLowerCase()));
  const snap = await getDocs(q);
  return !snap.empty;
}

/** Gera uma senha aleatória segura (12 caracteres hexadecimais) — usada pelo botão "Gerar senha" no cadastro. */
export function gerarSenhaAleatoria(): string {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Cria um novo usuário: conta no Firebase Auth (via app secundário, para não afetar
 * a sessão do admin) + perfil em Firestore. A senha de acesso é definida pelo próprio
 * admin no formulário de cadastro — repasse-a ao usuário por um canal seguro.
 */
export async function criarUsuario(input: CriarUsuarioInput, adminLogado: Usuario): Promise<string> {
  const email = input.email.trim().toLowerCase();

  const credencial = await createUserWithEmailAndPassword(authSecundario, email, input.senha);
  const uid = credencial.user.uid;
  await signOut(authSecundario);

  await setDoc(doc(db, COLLECTIONS.USUARIOS, uid), {
    nome: input.nome,
    email,
    perfil: input.perfil,
    baseId: input.baseId,
    telefone: input.telefone ?? "",
    status: input.status,
    criadoEm: serverTimestamp(),
    atualizadoEm: serverTimestamp(),
  });

  await registrarHistorico({
    entidade: "usuario",
    entidadeId: uid,
    acao: "criacao",
    descricao: `Usuário "${input.nome}" (${email}) foi cadastrado com o perfil ${input.perfil}.`,
    usuarioUid: adminLogado.uid,
    usuarioNome: adminLogado.nome,
  });

  return uid;
}

/**
 * Atualiza os dados de perfil do usuário em Firestore.
 * Não altera e-mail nem senha — o SDK do client não permite que um admin altere
 * credenciais de Auth de outra conta (isso exigiria o Admin SDK, em um backend).
 */
export async function atualizarUsuario(uid: string, input: UsuarioInput, adminLogado: Usuario): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.USUARIOS, uid), {
    nome: input.nome,
    perfil: input.perfil,
    baseId: input.baseId,
    telefone: input.telefone ?? "",
    status: input.status,
    atualizadoEm: serverTimestamp(),
  });

  await registrarHistorico({
    entidade: "usuario",
    entidadeId: uid,
    acao: "edicao",
    descricao: `Usuário "${input.nome}" foi atualizado (perfil: ${input.perfil}, status: ${input.status}).`,
    usuarioUid: adminLogado.uid,
    usuarioNome: adminLogado.nome,
  });
}

/**
 * Remove o cadastro de acesso do usuário em Firestore (ele deixa de conseguir usar o
 * sistema, pois o AuthContext exige um documento em "usuarios"). A conta em si no
 * Firebase Auth não é excluída — isso exige o Admin SDK, disponível apenas em um
 * backend/Cloud Function, que ainda não existe neste projeto. Se necessário, remova
 * a conta manualmente pelo Console do Firebase.
 */
export async function excluirUsuario(usuario: Usuario, adminLogado: Usuario): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.USUARIOS, usuario.uid));

  await registrarHistorico({
    entidade: "usuario",
    entidadeId: usuario.uid,
    acao: "exclusao",
    descricao: `Acesso do usuário "${usuario.nome}" (${usuario.email}) foi removido.`,
    usuarioUid: adminLogado.uid,
    usuarioNome: adminLogado.nome,
  });
}

/** Reenvia o e-mail de redefinição de senha (útil se o usuário perdeu o e-mail original ou esqueceu a senha). */
export async function reenviarRedefinicaoSenha(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}
