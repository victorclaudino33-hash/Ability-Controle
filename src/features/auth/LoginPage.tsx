import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useLocation } from "react-router-dom";
import { Activity, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, type LoginFormValues } from "./loginSchema";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erroSubmit, setErroSubmit] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginFormValues) {
    setErroSubmit(null);
    try {
      await login(values.email, values.senha);
      const destino = (location.state as { from?: string })?.from ?? "/dashboard";
      navigate(destino, { replace: true });
    } catch (err) {
      setErroSubmit(err instanceof Error ? err.message : "Não foi possível entrar.");
    }
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.05fr_1fr]">
      {/* Painel de marca */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-slate-900 p-12 text-white lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        <div
          className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-ability-red opacity-20 blur-3xl"
        />

        <div className="relative flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] bg-ability-red">
            <Activity className="h-5 w-5 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-display text-lg font-bold tracking-tight">
            Ability <span className="text-ability-red">Health Control</span>
          </span>
        </div>

        <div className="relative max-w-md">
          <p className="font-display text-3xl font-semibold leading-tight text-white">
            Toda a gestão de exames ocupacionais, em um único lugar.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-slate-300">
            Centralize colaboradores, exames, clínicas e bases de todas as
            unidades da Ability em uma plataforma segura e auditável.
          </p>

          <div className="mt-8 flex items-center gap-3 rounded-[var(--radius-md)] border border-white/10 bg-white/5 p-4">
            <ShieldCheck className="h-5 w-5 shrink-0 text-ability-red" />
            <p className="text-xs leading-relaxed text-slate-300">
              Acesso controlado por perfil, com autenticação segura via
              Firebase e trilha de auditoria completa.
            </p>
          </div>
        </div>

        <p className="relative text-xs text-slate-500">
          © {new Date().getFullYear()} Ability Tecnologia. Todos os direitos reservados.
        </p>
      </div>

      {/* Formulário */}
      <div className="flex items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] bg-ability-red">
              <Activity className="h-5 w-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-display text-lg font-bold tracking-tight text-slate-800">
              Ability <span className="text-ability-red">Health Control</span>
            </span>
          </div>

          <h1 className="font-display text-2xl font-bold text-slate-800">Entrar</h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Use as credenciais fornecidas pelo administrador do sistema.
          </p>

          <form className="mt-8 flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="nome@abilitytecnologia.com.br"
                hasError={!!errors.email}
                {...register("email")}
              />
              {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="senha">Senha</Label>
              <div className="relative">
                <Input
                  id="senha"
                  type={mostrarSenha ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  hasError={!!errors.senha}
                  className="pr-10"
                  {...register("senha")}
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                  aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                >
                  {mostrarSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.senha && <p className="text-xs text-danger">{errors.senha.message}</p>}
            </div>

            {erroSubmit && (
              <div className="rounded-[var(--radius-sm)] bg-danger-light px-3 py-2.5 text-sm text-danger">
                {erroSubmit}
              </div>
            )}

            <Button type="submit" size="lg" className="mt-2 w-full" loading={isSubmitting}>
              Entrar
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
