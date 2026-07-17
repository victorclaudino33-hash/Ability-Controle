import { useState } from "react";
import { Plus } from "lucide-react";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog } from "@/components/ui/dialog";

interface OpcaoComNome {
  id: string;
  nome: string;
}

interface SeletorComCadastroRapidoProps {
  label: string;
  placeholder: string;
  itens: OpcaoComNome[] | undefined;
  carregando: boolean;
  value: string;
  onChange: (id: string, nome: string) => void;
  onCriar: (nome: string) => Promise<OpcaoComNome>;
  hasError?: boolean;
  tituloCadastroRapido: string;
}

export function SeletorComCadastroRapido({
  label,
  placeholder,
  itens,
  carregando,
  value,
  onChange,
  onCriar,
  hasError,
  tituloCadastroRapido,
}: SeletorComCadastroRapidoProps) {
  const [dialogAberto, setDialogAberto] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function handleCriar() {
    if (!novoNome.trim()) return;
    setSalvando(true);
    try {
      const criado = await onCriar(novoNome.trim());
      onChange(criado.id, criado.nome);
      setNovoNome("");
      setDialogAberto(false);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Select
          value={value}
          hasError={hasError}
          disabled={carregando}
          onChange={(e) => {
            const selecionado = itens?.find((i) => i.id === e.target.value);
            onChange(e.target.value, selecionado?.nome ?? "");
          }}
        >
          <option value="">{carregando ? "Carregando..." : placeholder}</option>
          {itens?.map((item) => (
            <option key={item.id} value={item.id}>
              {item.nome}
            </option>
          ))}
        </Select>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setDialogAberto(true)}
          aria-label={tituloCadastroRapido}
          title={tituloCadastroRapido}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {itens && itens.length === 0 && !carregando && (
        <p className="text-xs text-slate-400">Nenhum cadastro ainda — use o botão + para criar.</p>
      )}

      <Dialog aberto={dialogAberto} onFechar={() => setDialogAberto(false)} titulo={tituloCadastroRapido} largura="sm">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="novo-nome-rapido">Nome</Label>
            <Input
              id="novo-nome-rapido"
              autoFocus
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCriar()}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setDialogAberto(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleCriar} loading={salvando} disabled={!novoNome.trim()}>
              Salvar
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
