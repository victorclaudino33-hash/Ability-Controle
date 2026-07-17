import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { MainLayout } from "@/components/layout/MainLayout";
import { LoginPage } from "@/features/auth/LoginPage";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { ColaboradoresPage } from "@/features/colaboradores/ColaboradoresPage";
import { EmpresasPage } from "@/features/empresas/EmpresasPage";
import { BasesPage } from "@/features/bases/BasesPage";
import { ClinicasPage } from "@/features/clinicas/ClinicasPage";
import { ExamesPage } from "@/features/exames/ExamesPage";
import { UsuariosPage } from "@/features/usuarios/UsuariosPage";
import { ImportacaoPage } from "@/features/importacao/ImportacaoPage";
import { HistoricoPage } from "@/features/historico/HistoricoPage";
import { RelatoriosPage } from "@/features/relatorios/RelatoriosPage";
import { ConfiguracoesPage } from "@/features/configuracoes/ConfiguracoesPage";
import { AcessoNegadoPage } from "@/pages/AcessoNegadoPage";
import { NaoEncontradoPage } from "@/pages/NaoEncontradoPage";
import { MeuPerfilPage } from "@/pages/MeuPerfilPage";

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/acesso-negado" element={<AcessoNegadoPage />} />

          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute modulo="dashboard">
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/colaboradores"
              element={
                <ProtectedRoute modulo="colaboradores">
                  <ColaboradoresPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/empresas"
              element={
                <ProtectedRoute modulo="empresas">
                  <EmpresasPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/bases"
              element={
                <ProtectedRoute modulo="bases">
                  <BasesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/clinicas"
              element={
                <ProtectedRoute modulo="clinicas">
                  <ClinicasPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/exames"
              element={
                <ProtectedRoute modulo="exames">
                  <ExamesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/usuarios"
              element={
                <ProtectedRoute modulo="usuarios">
                  <UsuariosPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/importacao"
              element={
                <ProtectedRoute modulo="importacao">
                  <ImportacaoPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/historico"
              element={
                <ProtectedRoute modulo="historico">
                  <HistoricoPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/relatorios"
              element={
                <ProtectedRoute modulo="relatorios">
                  <RelatoriosPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/configuracoes"
              element={
                <ProtectedRoute modulo="configuracoes">
                  <ConfiguracoesPage />
                </ProtectedRoute>
              }
            />

            <Route path="/meu-perfil" element={<MeuPerfilPage />} />
          </Route>

          <Route path="*" element={<NaoEncontradoPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
