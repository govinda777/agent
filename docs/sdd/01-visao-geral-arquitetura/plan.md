# Plano Tático - Visão Geral e Arquitetura

Este plano converte as regras de arquitetura geral em tarefas acionáveis e atômicas.

- [ ] **Passo 1: Setup Inicial do Monorepo**
  - [ ] Executar `npx create-next-app@latest` com TypeScript, Tailwind e App Router.
  - [ ] Limpar estilos padrões, criar diretórios bases (`src/components`, `src/lib`, `src/app/api`).
- [ ] **Passo 2: Configuração de Banco de Dados**
  - [ ] Adicionar o Prisma ORM (`npm install prisma @prisma/client`).
  - [ ] Inicializar o schema apontando para a string de conexão do Neon PostgreSQL.
  - [ ] Criar o modelo base de `Tenant` no Prisma.
- [ ] **Passo 3: Setup do Identity Provider (Privy)**
  - [ ] Instalar o SDK do Privy (`@privy-io/react-auth` e `@privy-io/server-auth`).
  - [ ] Envolver a aplicação com o `PrivyProvider` no `layout.tsx`.
- [ ] **Passo 4: Verificação da Arquitetura Base**
  - [ ] Executar migration inicial de DB.
  - [ ] Garantir que o app compila e roda na porta 3000 em dev.
