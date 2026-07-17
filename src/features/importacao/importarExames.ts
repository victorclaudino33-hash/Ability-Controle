import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/config/firebase";
import { COLLECTIONS } from "@/config/collections";
import { registrarHistorico } from "@/lib/historico";
import { normalizarTexto, normalizarData } from "./planilha";
import { limparCPF } from "@/lib/cpf";
import { listarColaboradores } from "@/features/colaboradores/colaboradorService";
import { listarClinicas } from "@/features/clinicas/clinicaService";
import { listarTiposExame, criarTipoExameRapido } from "@/features/configuracoes/tipoExameService";
import type { StatusExame } from "@/types/exame";
import type { LinhaPlanilha, ResultadoImportacao, ResultadoLinha } from "@/types/importacao";
import type { Usuario } from "@/types/auth";

export const CABECALHOS_EXAMES = [
  "CPF do colaborador",
  "Tipo de exame",
  "Clínica",
  "Data do exame (dd/mm/aaaa)",
  "Status (pendente/concluido/cancelado)",
  "Observações",
  "Nº do documento ASO (opcional)",
  "Link do ASO (opcional)",
];

export const EXEMPLO_EXAMES = [
  "123.456.789-09",
  "Periódico",
  "Clínica Exemplo",
  "10/03/2026",
  "concluido",
  "",
  "ASO-2026-0456",
  "",
];

const STATUS_VALIDOS: StatusExame[] = ["pendente", "concluido", "cancelado"];

interface LinhaExameNormalizada {
  colaboradorCpf: string;
  tipoNome: string;
  clinicaNome: string;
  data: string;
  status: string;
  observacoes: string;
  asoNumeroDocumento: string;
  asoLinkExterno: string;
}

function extrairCampos(linha: LinhaPlanilha): LinhaExameNormalizada {
  const pegar = (...chaves: string[]) => {
    for (const chave of chaves) {
      const valor = linha[normalizarTexto(chave)];
      if (valor) return valor;
    }
    return "";
  };

  return {
    colaboradorCpf: pegar("cpf do colaborador", "cpf"),
    tipoNome: pegar("tipo de exame", "tipo"),
    clinicaNome: pegar("clinica"),
    data: pegar("data do exame (dd/mm/aaaa)", "data do exame", "data"),
    status: pegar("status (pendente/concluido/cancelado)", "status"),
    observacoes: pegar("observacoes"),
    asoNumeroDocumento: pegar("no do documento aso (opcional)", "numero do documento aso", "aso"),
    asoLinkExterno: pegar("link do aso (opcional)", "link do aso"),
  };
}

export async function importarExames(linhas: LinhaPlanilha[], usuario: Usuario): Promise<ResultadoImportacao> {
  const detalhes: ResultadoLinha[] = [];

  const [colaboradores, clinicas, tipos] = await Promise.all([
    listarColaboradores(),
    listarClinicas(),
    listarTiposExame(),
  ]);

  const mapaColaboradores = new Map(colaboradores.map((c) => [limparCPF(c.cpf), c]));
  const mapaClinicas = new Map(clinicas.map((c) => [normalizarTexto(c.nome), c]));
  const mapaTipos = new Map(tipos.map((t) => [normalizarTexto(t.nome), t]));

  let criados = 0;

  for (let i = 0; i < linhas.length; i++) {
    const numeroLinha = i + 2;
    const campos = extrairCampos(linhas[i]);
    const identificador = campos.colaboradorCpf || `linha ${numeroLinha}`;

    if (!campos.colaboradorCpf || !campos.tipoNome || !campos.clinicaNome || !campos.data) {
      detalhes.push({
        linha: numeroLinha,
        status: "erro",
        identificador,
        mensagem: "CPF, tipo de exame, clínica e data são obrigatórios.",
      });
      continue;
    }

    const cpfLimpo = limparCPF(campos.colaboradorCpf);
    const colaborador = mapaColaboradores.get(cpfLimpo);
    if (!colaborador) {
      detalhes.push({
        linha: numeroLinha,
        status: "erro",
        identificador,
        mensagem: "Colaborador com esse CPF não foi encontrado — cadastre-o antes de importar os exames.",
      });
      continue;
    }

    const clinica = mapaClinicas.get(normalizarTexto(campos.clinicaNome));
    if (!clinica) {
      detalhes.push({
        linha: numeroLinha,
        status: "erro",
        identificador: colaborador.nome,
        mensagem: `Clínica "${campos.clinicaNome}" não encontrada — cadastre-a antes de importar.`,
      });
      continue;
    }

    const data = normalizarData(campos.data);
    if (!data) {
      detalhes.push({
        linha: numeroLinha,
        status: "erro",
        identificador: colaborador.nome,
        mensagem: "Data do exame inválida (use dd/mm/aaaa).",
      });
      continue;
    }

    const statusNormalizado = normalizarTexto(campos.status) as StatusExame;
    const status: StatusExame = STATUS_VALIDOS.includes(statusNormalizado) ? statusNormalizado : "pendente";

    // Tipo de exame é criado automaticamente se ainda não existir (é só um nome, sem campos obrigatórios extras)
    let tipo = mapaTipos.get(normalizarTexto(campos.tipoNome));
    if (!tipo) {
      tipo = await criarTipoExameRapido(campos.tipoNome);
      mapaTipos.set(normalizarTexto(tipo.nome), tipo);
    }

    const possuiASO = Boolean(campos.asoNumeroDocumento || campos.asoLinkExterno);

    try {
      await addDoc(collection(db, COLLECTIONS.EXAMES), {
        colaboradorId: colaborador.id,
        colaboradorNome: colaborador.nome,
        colaboradorCpf: colaborador.cpf,
        tipoId: tipo.id,
        tipoNome: tipo.nome,
        clinicaId: clinica.id,
        clinicaNome: clinica.nome,
        data,
        status,
        observacoes: campos.observacoes || "",
        possuiASO,
        aso: possuiASO
          ? {
              nomeArquivo: "",
              numeroDocumento: campos.asoNumeroDocumento || "",
              linkExterno: campos.asoLinkExterno || undefined,
            }
          : null,
        criadoEm: serverTimestamp(),
        atualizadoEm: serverTimestamp(),
      });
      criados++;
      detalhes.push({ linha: numeroLinha, status: "sucesso", identificador: colaborador.nome });
    } catch {
      detalhes.push({ linha: numeroLinha, status: "erro", identificador: colaborador.nome, mensagem: "Falha ao salvar no Firestore." });
    }
  }

  if (criados > 0) {
    await registrarHistorico({
      entidade: "exame",
      entidadeId: "importacao-em-massa",
      acao: "criacao",
      descricao: `Importação em massa: ${criados} exame(s) cadastrado(s) via planilha.`,
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
