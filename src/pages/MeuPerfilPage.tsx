import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PERFIL_LABEL, PERFIL_BADGE_VARIANT } from "@/config/perfilLabels";

export function MeuPerfilPage() {
  const { usuario } = useAuth();
  if (!usuario) return null;

  const campos = [
    { label: "Nome", valor: usuario.nome },
    { label: "E-mail", valor: usuario.email },
    { label: "Telefone", valor: usuario.telefone || "—" },
    { label: "Status", valor: usuario.status === "ativo" ? "Ativo" : "Inativo" },
  ];

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Meu Perfil</CardTitle>
          <Badge variant={PERFIL_BADGE_VARIANT[usuario.perfil]}>{PERFIL_LABEL[usuario.perfil]}</Badge>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {campos.map((campo) => (
          <div key={campo.label}>
            <p className="text-xs font-medium text-slate-500">{campo.label}</p>
            <p className="mt-0.5 text-sm text-slate-800">{campo.valor}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
