import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, orderBy, query, where, serverTimestamp } from "firebase/firestore";
import { db } from "@/config/firebase";
import { COLLECTIONS } from "@/config/collections";
import { registrarHistorico } from "@/lib/historico";
import type { TipoExame } from "@/types/tipoExame";
import type { Usuario } from "@/types/auth";

/** Tipos padrão definidos no escopo do sistema — semeados automaticamente na primeira consulta. */
const TIPOS_PADRAO = [
  "Admissional",
  "Demissional",
  "Periódico",
  "Clínico",
  "Retorno ao Trabalho",
  "Mudança de Função",
];

async function semearTiposPadrao(): Promise<void> {
  await Promise.all(
    TIPOS_PADRAO.map((nome) =>
      addDoc(collection(db, COLLECTIONS.TIPOS_EXAME), {
        nome,
        padrao: true,
        criadoEm: serverTimestamp(),
      })
    )
  );
}

export async function listarTiposExame(): Promise<TipoExame[]> {
  const q = query(collection(db, COLLECTIONS.TIPOS_EXAME), orderBy("nome"));
  let snap = await getDocs(q);

  if (snap.empty) {
    await semearTiposPadrao();
    snap = await getDocs(q);
  }

  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<TipoExame, "id">) }));
}

/** Criação rápida usada no cadastro inline do formulário de Exames (Configurações terá gestão completa) */
export async function criarTipoExameRapido(nome: string): Promise<TipoExame> {
  const ref = await addDoc(collection(db, COLLECTIONS.TIPOS_EXAME), {
    nome,
    padrao: false,
    criadoEm: serverTimestamp(),
  });
  return { id: ref.id, nome, padrao: false, criadoEm: new Date().toISOString() };
}

/** Cria um tipo de exame a partir da tela de Configurações, registrando no histórico. */
export async function criarTipoExame(nome: string, usuario: Usuario): Promise<TipoExame> {
  const tipo = await criarTipoExameRapido(nome);

  await registrarHistorico({
    entidade: "tipoExame",
    entidadeId: tipo.id,
    acao: "criacao",
    descricao: `Tipo de exame "${nome}" foi cadastrado.`,
    usuarioUid: usuario.uid,
    usuarioNome: usuario.nome,
  });

  return tipo;
}

/** Renomeia um tipo de exame. Não altera os exames já cadastrados com o nome antigo (denormalizado). */
export async function atualizarTipoExame(id: string, nome: string, usuario: Usuario): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.TIPOS_EXAME, id), { nome });

  await registrarHistorico({
    entidade: "tipoExame",
    entidadeId: id,
    acao: "edicao",
    descricao: `Tipo de exame renomeado para "${nome}".`,
    usuarioUid: usuario.uid,
    usuarioNome: usuario.nome,
  });
}

/** Quantos exames já cadastrados usam este tipo — usado para bloquear exclusões que quebrariam histórico de exames. */
async function contarExamesComTipo(tipoId: string): Promise<number> {
  const q = query(collection(db, COLLECTIONS.EXAMES), where("tipoId", "==", tipoId));
  const snap = await getDocs(q);
  return snap.size;
}

/** Exclui um tipo de exame, desde que não esteja em uso por nenhum exame cadastrado. */
export async function excluirTipoExame(tipo: TipoExame, usuario: Usuario): Promise<void> {
  const emUso = await contarExamesComTipo(tipo.id);
  if (emUso > 0) {
    throw new Error(
      `Não é possível excluir "${tipo.nome}": ${emUso} exame(s) já usam este tipo. Edite ou exclua esses exames primeiro.`
    );
  }

  await deleteDoc(doc(db, COLLECTIONS.TIPOS_EXAME, tipo.id));

  await registrarHistorico({
    entidade: "tipoExame",
    entidadeId: tipo.id,
    acao: "exclusao",
    descricao: `Tipo de exame "${tipo.nome}" foi excluído.`,
    usuarioUid: usuario.uid,
    usuarioNome: usuario.nome,
  });
}
