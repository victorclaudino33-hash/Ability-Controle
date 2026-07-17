import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/config/firebase";
import { COLLECTIONS } from "@/config/collections";
import { registrarHistorico } from "@/lib/historico";
import { normalizarTexto, normalizarData } from "./planilha";
import { limparCPF, validarCPF } from "@/lib/cpf";
import { listarEmpresas, criarEmpresaRapida } from "@/features/empresas/empresaService";
import { listarBases, criarBaseRapida } from "@/features/bases/baseService";
import { existeColaboradorComCPF } from "@/features/colaboradores/colaboradorService";
import type { LinhaPlanilha, ResultadoImportacao, ResultadoLinha } from "@/types/importacao";
import type { Usuario } from "@/types/auth";

/** Cabeçalhos esperados na planilha de Colaboradores (já normalizados) */
export const CABECALHOS_COLABORADORES = [
  "Nome completo",
  "CPF",
  "RE",
  "Empresa",
  "Base",
  "Supervisor",
  "Cargo",
  "Telefone",
  "E-mail",
  "Data de admissão (dd/mm/aaaa)",
  "Status (ativo/inativo)",
];

export const EXEMPLO_COLABORADORES = [
  "Maria da Silva",
  "123.456.789-09",
  "RE00123",
  "Empresa Exemplo Ltda",
  "Base Central",
  "João Souza",
  "Vigilante",
  "(11) 91234-5678",
  "maria.silva@exemplo.com",
  "01/03/2026",
  "ativo",
];

interface LinhaColaboradorNormalizada {
  nome: string;
  cpf: string;
  re: string;
  empresaNome: string;
  baseNome: string;
  supervisor: string;
  cargo: string;
  telefone: string;
  email: string;
  dataAdmissao: string;
  status: string;
}

/** Lê os campos de uma linha da planilha tolerando pequenas variações de cabeçalho. */
function extrairCampos(linha: LinhaPlanilha): LinhaColaboradorNormalizada {
  const pegar = (...chaves: string[]) => {
    for (const chave of chaves) {
      const valor = linha[normalizarTexto(chave)];
      if (valor) return valor;
    }
    return "";
  };

  return {
    nome: pegar("nome completo", "nome"),
    cpf: pegar("cpf"),
    re: pegar("re"),
    empresaNome: pegar("empresa"),
    baseNome: pegar("base"),
    supervisor: pegar("supervisor"),
    cargo: pegar("cargo"),
    telefone: pegar("telefone", "celular"),
    email: pegar("e-mail", "email"),
    dataAdmissao: pegar("data de admissao (dd/mm/aaaa)", "data de admissao", "data admissao", "admissao"),
    status: pegar("status (ativo/inativo)", "status"),
  };
}

export async function importarColaboradores(
  linhas: LinhaPlanilha[],
  usuario: Usuario
): Promise<ResultadoImportacao> {
  const detalhes: ResultadoLinha[] = [];

  const [empresas, bases] = await Promise.all([listarEmpresas(), listarBases()]);
  const mapaEmpresas = new Map(empresas.map((e) => [normalizarTexto(e.nome), e]));
  const mapaBases = new Map(bases.map((b) => [normalizarTexto(b.nome), b]));

  let criados = 0;

  for (let i = 0; i < linhas.length; i++) {
    const numeroLinha = i + 2; // +1 pelo cabeçalho, +1 porque a lista é 0-indexada
    const campos = extrairCampos(linhas[i]);
    const identificador = campos.nome || campos.cpf || `linha ${numeroLinha}`;

    if (!campos.nome || !campos.cpf) {
      detalhes.push({ linha: numeroLinha, status: "erro", identificador, mensagem: "Nome e CPF são obrigatórios." });
      continue;
    }

    if (!validarCPF(campos.cpf)) {
      detalhes.push({ linha: numeroLinha, status: "erro", identificador, mensagem: "CPF inválido." });
      continue;
    }

    const cpfLimpo = limparCPF(campos.cpf);
    const jaExiste = await existeColaboradorComCPF(cpfLimpo);
    if (jaExiste) {
      detalhes.push({ linha: numeroLinha, status: "ignorada", identificador, mensagem: "CPF já cadastrado — linha ignorada." });
      continue;
    }

    if (!campos.empresaNome || !campos.baseNome) {
      detalhes.push({ linha: numeroLinha, status: "erro", identificador, mensagem: "Empresa e Base são obrigatórias." });
      continue;
    }

    if (!campos.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(campos.email)) {
      detalhes.push({ linha: numeroLinha, status: "erro", identificador, mensagem: "E-mail inválido ou não informado." });
      continue;
    }

    const dataAdmissao = normalizarData(campos.dataAdmissao);
    if (!dataAdmissao) {
      detalhes.push({ linha: numeroLinha, status: "erro", identificador, mensagem: "Data de admissão inválida (use dd/mm/aaaa)." });
      continue;
    }

    const statusNormalizado = normalizarTexto(campos.status);
    const status = statusNormalizado === "inativo" ? "inativo" : "ativo";

    // Resolve empresa/base por nome, criando automaticamente (só com o nome) se ainda não existir
    let empresa = mapaEmpresas.get(normalizarTexto(campos.empresaNome));
    if (!empresa) {
      empresa = await criarEmpresaRapida(campos.empresaNome);
      mapaEmpresas.set(normalizarTexto(empresa.nome), empresa);
    }

    let base = mapaBases.get(normalizarTexto(campos.baseNome));
    if (!base) {
      base = await criarBaseRapida(campos.baseNome);
      mapaBases.set(normalizarTexto(base.nome), base);
    }

    try {
      await addDoc(collection(db, COLLECTIONS.COLABORADORES), {
        nome: campos.nome,
        cpf: cpfLimpo,
        re: campos.re,
        empresaId: empresa.id,
        empresaNome: empresa.nome,
        baseId: base.id,
        baseNome: base.nome,
        supervisor: campos.supervisor,
        cargo: campos.cargo,
        telefone: campos.telefone,
        email: campos.email,
        dataAdmissao,
        status,
        criadoEm: serverTimestamp(),
        atualizadoEm: serverTimestamp(),
      });
      criados++;
      detalhes.push({ linha: numeroLinha, status: "sucesso", identificador });
    } catch {
      detalhes.push({ linha: numeroLinha, status: "erro", identificador, mensagem: "Falha ao salvar no Firestore." });
    }
  }

  if (criados > 0) {
    await registrarHistorico({
      entidade: "colaborador",
      entidadeId: "importacao-em-massa",
      acao: "criacao",
      descricao: `Importação em massa: ${criados} colaborador(es) cadastrado(s) via planilha.`,
      usuarioUid: usuario.uid,
      usuarioNome: usuario.nome,
    });
  }

  return {
    total: linhas.length,
    sucesso: detalhes.filter((d) => d.status === "sucesso").length,
    ignoradas: detalhes.filter((d) => d.status === "ignorada").length,
    erros: detalhes.filter((d) => d.status === "erro").length,
    detalhes,
  };
}
