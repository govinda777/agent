# Plano Tático - Jornada do Desenvolvedor e Setup Local

Este roteiro atua como o checklist da infraestrutura necessária à máquina de quem programa.

- [ ] **Passo 1: Orquestração em Contentores (Docker)**
  - [ ] Criar ficheiro base `docker-compose.yml` na raiz mapeando as portas padrão.
  - [ ] Adicionar o serviço PostgreSQL (versão correspondente ao Neon DB) mapeado para `5432`.
  - [ ] Adicionar um ficheiro `.env` na raiz ignorado pelo GIT para guardar chaves locais (`DATABASE_URL="postgres://postgres:password@localhost:5432/govindadb"`).

- [ ] **Passo 2: Ferramentas de Linting & Qualidade Semântica**
  - [ ] Instalar o CommitLint e a configuração base (`npm install -D @commitlint/config-conventional @commitlint/cli`).
  - [ ] Configurar ficheiro `commitlint.config.js`.
  - [ ] Configurar no `husky` o hook `commit-msg` para executar `npx --no -- commitlint --edit ${1}`.
  - [ ] Instalar o Prettier e ativar extensões no ESLint do Next.js.

- [ ] **Passo 3: Mocks e População (Seed)**
  - [ ] Criar `prisma/seed.ts`.
  - [ ] Preencher as queries no `seed.ts` para criar um Tenant, um Agente com nome predefinido, e uma Virtual Key no Integration Vault.
  - [ ] Adicionar o comando no `package.json`: `"db:reset": "npx prisma migrate reset --force --skip-seed && npx prisma db seed"`.

- [ ] **Passo 4: Atalhos de Agilidade (NPM Scripts)**
  - [ ] Criar o script `"dev:all"` que roda um comando em cadeia: sobe o `docker-compose up -d`, aguarda 3s, corre o `db:reset`, e por fim chama o `next dev`.
  - [ ] Configurar o MSW também na porta de desenvolvimento. Ativar flag `MOCK_NETWORK=true` no env que ligue a subscrição de respostas mockadas antes da aplicação de React e das APIs (Rotas Node) carregarem.
