# Ability Health Control

Sistema corporativo de gestão de exames ocupacionais da Ability Tecnologia.

## Stack
React 19 + Vite + TypeScript + Tailwind CSS v4 + React Router DOM + React Hook Form + Zod + React Query + Firebase (Auth + Firestore) + Lucide React.

## Como rodar

```bash
npm install
cp .env.example .env.local   # preencha com as credenciais do seu projeto Firebase
npm run dev
```

## Configuração do Firebase

1. Crie um projeto em https://console.firebase.google.com
2. Ative **Authentication** (método E-mail/Senha) e **Firestore Database**
3. Em "Configurações do projeto" > "Seus apps", crie um app Web e copie as chaves para `.env.local`
4. Crie manualmente o primeiro usuário administrador:
   - Crie o usuário em Authentication > Users
   - Crie um documento na coleção `usuarios` com o **mesmo UID**, contendo:
     ```json
     {
       "uid": "<uid-do-usuario>",
       "nome": "Seu Nome",
       "email": "seu@email.com",
       "perfil": "administrador",
       "baseId": null,
       "status": "ativo",
       "criadoEm": "2026-07-15T00:00:00.000Z",
       "atualizadoEm": "2026-07-15T00:00:00.000Z"
     }
     ```

## Estrutura de pastas

```
src/
  components/
    ui/         -> primitivos de UI (Button, Input, Card, Badge...)
    layout/     -> Sidebar, Navbar, MainLayout
    shared/     -> componentes reutilizáveis entre módulos
  config/       -> firebase.ts, collections.ts, permissions.ts, menu.ts
  contexts/     -> AuthContext (login, logout, perfil)
  features/     -> um subdiretório por módulo de negócio (auth, dashboard, colaboradores...)
  routes/       -> ProtectedRoute
  pages/        -> páginas soltas (403, 404, Meu Perfil)
  types/        -> tipos globais (auth, permissions)
```

## Módulo Colaboradores

CRUD completo (`src/features/colaboradores`) com:
- Campos: Nome, CPF (validado e formatado), RE, Empresa, Base, Supervisor, Cargo, Telefone, E-mail, Data de Admissão, Status
- Pesquisa em tempo real (com debounce) por Nome, CPF, RE, Empresa ou Base
- Validação de CPF duplicado ao salvar
- Botões de criar/editar/excluir aparecem apenas conforme a permissão do perfil logado

Os módulos **Empresas** e **Bases** já têm CRUD completo próprio (`/empresas`,
`/bases`). O formulário de Colaborador também mantém um "cadastro rápido"
(botão **+** ao lado do select) para não travar o cadastro de colaborador
quando a empresa/base ainda não existir — ele grava nas mesmas coleções
`empresas`/`bases`, então os dados aparecem automaticamente nas telas
completas também.

## Módulo Exames

CRUD completo (`src/features/exames`), o módulo central do sistema:
- Vínculo com Colaborador (combobox pesquisável por nome/CPF, já que pode haver centenas de colaboradores)
- Tipo de exame configurável — `tiposExame` já vem semeado automaticamente com
  Admissional, Demissional, Periódico, Clínico, Retorno ao Trabalho e Mudança
  de Função na primeira consulta; novos tipos podem ser criados direto no
  formulário (cadastro rápido) e serão geridos por completo no módulo
  **Configurações**
- Vínculo com Clínica (lista as clínicas já cadastradas)
- Campo **Possui ASO**: quando marcado, exige Nome do Arquivo e Número do
  Documento, com Link Externo e Observação opcionais — **nenhum arquivo é
  armazenado**, apenas a referência, conforme especificado
- Toda criação, edição e exclusão de exame grava automaticamente um registro
  em `historico` (coleção já pronta para a tela de Histórico, que será a
  interface de consulta desses registros)
- Filtros por Tipo e Status, além de pesquisa por colaborador/CPF/clínica

## Módulo Clínicas

CRUD completo (`src/features/clinicas`) com CNPJ validado, responsável,
telefone, e-mail, cidade/UF, observações e status — pesquisa por nome, cidade
ou CNPJ.

## Controle de acesso por perfil

Toda a autorização (menu, rotas e botões) é derivada de uma única fonte:
`src/config/permissions.ts` (`PERMISSOES`). Não há páginas duplicadas para
Admin/Operador — o mesmo `MainLayout` e as mesmas rotas mudam de conteúdo
conforme o perfil resolvido no Firestore após o login.

## Status do desenvolvimento

- [x] Setup do projeto (Vite, Tailwind, estrutura de pastas)
- [x] Firebase (Auth + Firestore) configurado
- [x] Tema / Paleta Ability
- [x] Autenticação (login, identificação automática de perfil)
- [x] Layout principal (Sidebar + Navbar dinâmicos por perfil)
- [x] Rotas protegidas + página de Acesso Negado (403)
- [x] Dashboard (versão inicial, dados mockados)
- [x] Colaboradores (CRUD completo, com pesquisa e cadastro rápido de Empresa/Base)
- [x] Empresas (CRUD completo)
- [x] Bases (CRUD completo)
- [x] Clínicas (CRUD completo)
- [x] Exames (CRUD completo, com ASO e histórico automático)
- [ ] Importação em massa
- [ ] Usuários (CRUD + Firebase Auth)
- [ ] Relatórios
- [ ] Configurações
- [ ] Firestore Security Rules
- [ ] Logs de auditoria
