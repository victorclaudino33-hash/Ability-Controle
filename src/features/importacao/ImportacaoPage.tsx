import { useRef, useState } from "react";
import {
  UploadCloud,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Users,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { podeExecutarAcao } from "@/config/permissions";
import { cn } from "@/lib/utils";
import { lerArquivoPlanilha, baixarModeloPlanilha } from "./planilha";
import { CABECALHOS_COLABORADORES, EXEMPLO_COLABORADORES } from "./importarColaboradores";
import { CABECALHOS_EXAMES, EXEMPLO_EXAMES } from "./importarExames";
import { useImportarColaboradores, useImportarExames } from "./useImportacao";
import type { LinhaPlanilha, ResultadoImportacao, TipoImportacao } from "@/types/importacao";

const ABAS: { tipo: TipoImportacao; label: string; icon: typeof Users }[] = [
  { tipo: "colaboradores", label: "Colaboradores", icon: Users },
  { tipo: "exames", label: "Exames", icon: ClipboardList },
];

export function ImportacaoPage() {
  const { usuario } = useAuth();
  const perfil = usuario!.perfil;
  const podeImportar = podeExecutarAcao(perfil, "importacao", "importar");

  const [aba, setAba] = useState<TipoImportacao>("colaboradores");
  const [nomeArquivo, setNomeArquivo] = useState<string | null>(null);
  const [linhas, setLinhas] = useState<LinhaPlanilha[] | null>(null);
  const [erroLeitura, setErroLeitura] = useState<string | null>(null);
  const [resultado, setResultado] = useState<ResultadoImportacao | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const importarColaboradores = useImportarColaboradores();
  const importarExames = useImportarExames();
  const importando = importarColaboradores.isPending || importarExames.isPending;

  function trocarAba(novaAba: TipoImportacao) {
    setAba(novaAba);
    setNomeArquivo(null);
    setLinhas(null);
    setErroLeitura(null);
    setResultado(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function baixarModelo() {
    if (aba === "colaboradores") {
      baixarModeloPlanilha("modelo-colaboradores.xlsx", CABECALHOS_COLABORADORES, EXEMPLO_COLABORADORES);
    } else {
      baixarModeloPlanilha("modelo-exames.xlsx", CABECALHOS_EXAMES, EXEMPLO_EXAMES);
    }
  }

  async function handleArquivoSelecionado(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;

    setErroLeitura(null);
    setResultado(null);
    setNomeArquivo(arquivo.name);

    try {
      const linhasLidas = await lerArquivoPlanilha(arquivo);
      if (linhasLidas.length === 0) {
        setErroLeitura("A planilha não tem nenhuma linha de dados abaixo do cabeçalho.");
        setLinhas(null);
        return;
      }
      setLinhas(linhasLidas);
    } catch {
      setErroLeitura("Não foi possível ler este arquivo. Confira se é um .xlsx ou .csv válido.");
      setLinhas(null);
    }
  }

  async function handleImportar() {
    if (!linhas || !usuario) return;
    const res =
      aba === "colaboradores"
        ? await importarColaboradores.mutateAsync({ linhas, usuario })
        : await importarExames.mutateAsync({ linhas, usuario });
    setResultado(res);
  }

  const colunasPreview = linhas && linhas.length > 0 ? Object.keys(linhas[0]) : [];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-display text-xl font-bold text-slate-800">Importação em Massa</h2>
        <p className="text-sm text-slate-500">Cadastre vários colaboradores ou exames de uma vez a partir de uma planilha.</p>
      </div>

      <div className="flex gap-2 border-b border-slate-200">
        {ABAS.map(({ tipo, label, icon: Icon }) => (
          <button
            key={tipo}
            onClick={() => trocarAba(tipo)}
            className={cn(
              "flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
              aba === tipo
                ? "border-ability-red text-ability-red"
                : "border-transparent text-slate-500 hover:text-slate-700"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {!podeImportar ? (
        <div className="rounded-[var(--radius-lg)] border border-dashed border-slate-300 bg-white py-16 text-center">
          <p className="text-sm font-medium text-slate-600">Seu perfil não tem permissão para importar dados.</p>
          <p className="mt-1 text-sm text-slate-400">Fale com um administrador se precisar deste acesso.</p>
        </div>
      ) : (
        <>
          <div className="rounded-[var(--radius-lg)] border border-slate-200 bg-white p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-800">
                  1. Baixe o modelo e preencha com os dados de {aba === "colaboradores" ? "colaboradores" : "exames"}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {aba === "colaboradores"
                    ? "Colaboradores com CPF já cadastrado são ignorados automaticamente. Empresa e Base são criadas se ainda não existirem."
                    : "O CPF precisa pertencer a um colaborador já cadastrado, e a clínica precisa já existir. Tipos de exame novos são criados automaticamente."}
                </p>
              </div>
              <Button variant="outline" onClick={baixarModelo} className="shrink-0">
                <Download className="h-4 w-4" />
                Baixar modelo (.xlsx)
              </Button>
            </div>

            <div className="mt-5 border-t border-slate-200 pt-5">
              <h3 className="text-sm font-semibold text-slate-800">2. Envie o arquivo preenchido (.xlsx ou .csv)</h3>
              <div className="mt-3 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                <Button variant="outline" onClick={() => inputRef.current?.click()}>
                  <UploadCloud className="h-4 w-4" />
                  Selecionar arquivo
                </Button>
                <input
                  ref={inputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={handleArquivoSelecionado}
                />
                {nomeArquivo && (
                  <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
                    <FileSpreadsheet className="h-4 w-4 text-slate-400" />
                    {nomeArquivo}
                    {linhas && <span className="text-slate-400">— {linhas.length} linha(s) encontrada(s)</span>}
                  </span>
                )}
              </div>
              {erroLeitura && <p className="mt-2 text-sm text-danger">{erroLeitura}</p>}
            </div>
          </div>

          {linhas && linhas.length > 0 && (
            <div className="rounded-[var(--radius-lg)] border border-slate-200 bg-white p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-sm font-semibold text-slate-800">3. Confira a prévia e importe</h3>
                <Button onClick={handleImportar} loading={importando}>
                  Importar {linhas.length} registro(s)
                </Button>
              </div>

              <div className="mt-4 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {colunasPreview.map((c) => (
                        <TableHead key={c} className="whitespace-nowrap capitalize">{c}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {linhas.slice(0, 5).map((linha, i) => (
                      <TableRow key={i}>
                        {colunasPreview.map((c) => (
                          <TableCell key={c} className="whitespace-nowrap">{linha[c] || "—"}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {linhas.length > 5 && (
                  <p className="mt-2 text-xs text-slate-400">Mostrando as 5 primeiras de {linhas.length} linhas.</p>
                )}
              </div>
            </div>
          )}

          {resultado && (
            <div className="rounded-[var(--radius-lg)] border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-semibold text-slate-800">Resultado da importação</h3>

              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="flex items-center gap-2 rounded-[var(--radius-sm)] bg-success-light px-4 py-3">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  <div>
                    <p className="text-lg font-bold text-success">{resultado.sucesso}</p>
                    <p className="text-xs text-success">importado(s) com sucesso</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-[var(--radius-sm)] bg-warning-light px-4 py-3">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  <div>
                    <p className="text-lg font-bold text-warning">{resultado.ignoradas}</p>
                    <p className="text-xs text-warning">ignorado(s) — já cadastrado(s)</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-[var(--radius-sm)] bg-danger-light px-4 py-3">
                  <XCircle className="h-5 w-5 text-danger" />
                  <div>
                    <p className="text-lg font-bold text-danger">{resultado.erros}</p>
                    <p className="text-xs text-danger">com erro</p>
                  </div>
                </div>
              </div>

              {resultado.detalhes.some((d) => d.status !== "sucesso") && (
                <div className="mt-4 max-h-80 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Linha</TableHead>
                        <TableHead>Identificador</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Motivo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {resultado.detalhes
                        .filter((d) => d.status !== "sucesso")
                        .map((d) => (
                          <TableRow key={d.linha}>
                            <TableCell>{d.linha}</TableCell>
                            <TableCell className="font-medium text-slate-800">{d.identificador}</TableCell>
                            <TableCell>
                              <Badge variant={d.status === "ignorada" ? "warning" : "danger"}>
                                {d.status === "ignorada" ? "Ignorada" : "Erro"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-slate-600">{d.mensagem}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
