import {
  Users,
  ClipboardList,
  UserPlus,
  UserMinus,
  CalendarClock,
  Stethoscope,
  Hourglass,
  CheckCircle2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CardIndicador {
  label: string;
  valor: string;
  icon: LucideIcon;
  tone: "neutral" | "danger" | "success" | "warning" | "info";
}

const toneClasses: Record<CardIndicador["tone"], string> = {
  neutral: "bg-slate-100 text-slate-600",
  danger: "bg-danger-light text-danger",
  success: "bg-success-light text-success",
  warning: "bg-warning-light text-warning",
  info: "bg-info-light text-info",
};

// Dados de exemplo — serão substituídos por queries reais ao Firestore (React Query) na próxima etapa.
const CARDS_ADMIN: CardIndicador[] = [
  { label: "Total de Colaboradores", valor: "1.284", icon: Users, tone: "neutral" },
  { label: "Total de Exames", valor: "3.912", icon: ClipboardList, tone: "info" },
  { label: "Admissionais", valor: "142", icon: UserPlus, tone: "success" },
  { label: "Demissionais", valor: "58", icon: UserMinus, tone: "danger" },
  { label: "Periódicos", valor: "2.106", icon: CalendarClock, tone: "info" },
  { label: "Clínicos", valor: "310", icon: Stethoscope, tone: "neutral" },
  { label: "Pendentes", valor: "87", icon: Hourglass, tone: "warning" },
  { label: "Concluídos", valor: "3.825", icon: CheckCircle2, tone: "success" },
];

const CARDS_OPERADOR: CardIndicador[] = [
  { label: "Meus Colaboradores", valor: "184", icon: Users, tone: "neutral" },
  { label: "Exames em Aberto", valor: "23", icon: ClipboardList, tone: "info" },
  { label: "Pendentes", valor: "9", icon: Hourglass, tone: "warning" },
  { label: "Concluídos (mês)", valor: "412", icon: CheckCircle2, tone: "success" },
];

export function DashboardPage() {
  const { usuario } = useAuth();
  const ehVisaoCompleta = usuario?.perfil === "administrador" || usuario?.perfil === "supervisor";
  const cards = ehVisaoCompleta ? CARDS_ADMIN : CARDS_OPERADOR;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-xl font-bold text-slate-800">
          Olá, {usuario?.nome?.split(" ")[0] ?? "usuário"} 👋
        </h2>
        <p className="text-sm text-slate-500">
          {ehVisaoCompleta
            ? "Aqui está a visão geral de todas as bases da Ability."
            : "Aqui está a visão dos exames sob sua responsabilidade."}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label}>
            <CardContent className="flex items-start justify-between p-4">
              <div>
                <p className="text-xs font-medium text-slate-500">{card.label}</p>
                <p className="mt-1.5 font-display text-2xl font-bold text-slate-800">{card.valor}</p>
              </div>
              <div className={cn("flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)]", toneClasses[card.tone])}>
                <card.icon className="h-4.5 w-4.5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <p className="font-display text-sm font-semibold text-slate-800">Exames por tipo</p>
            <p className="mt-1 text-xs text-slate-500">Gráfico será implementado na etapa de Dashboard avançado.</p>
            <div className="mt-4 flex h-48 items-center justify-center rounded-[var(--radius-md)] bg-slate-50 text-xs text-slate-400">
              Gráfico de exames por tipo
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="font-display text-sm font-semibold text-slate-800">
              {ehVisaoCompleta ? "Exames por Base" : "Últimas atividades"}
            </p>
            <p className="mt-1 text-xs text-slate-500">Gráfico será implementado na etapa de Dashboard avançado.</p>
            <div className="mt-4 flex h-48 items-center justify-center rounded-[var(--radius-md)] bg-slate-50 text-xs text-slate-400">
              {ehVisaoCompleta ? "Gráfico por Base" : "Lista de atividades recentes"}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
