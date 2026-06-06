# Plano Tático - Estratégia de Testes e Qualidade

Este plano operacionaliza a adoção do Test-Driven Development (TDD) e automações do Git.

- [ ] **Passo 1: Instalação e Configuração da Stack Base**
  - [ ] Instalar o Vitest e dependências (`npm i -D vitest @vitest/coverage-v8 @testing-library/react`).
  - [ ] Criar o ficheiro `vitest.config.ts` especificando a pasta de `/tests/unit`.
  - [ ] Instalar o Playwright (`npx playwright install`) para mapear UI/E2E em `/tests/e2e`.

- [ ] **Passo 2: Implementação do Mock Service Worker (MSW) e Banco**
  - [ ] Instalar o MSW (`npm i -D msw`) e configurar o `setupServer` do Vitest.
  - [ ] Instalar o `vitest-mock-extended` e configurar o ficheiro de Prisma Mock Global (`src/lib/__mocks__/prisma.ts`).
  - [ ] Garantir que testes de unidade não chamem a URL real do Neon.

- [ ] **Passo 3: Automação e Pipeline Local (Husky)**
  - [ ] Instalar o Husky e lint-staged (`npm i -D husky lint-staged`).
  - [ ] Configurar o hook `pre-commit`: Executar `lint-staged` -> rodando comando `vitest run --passWithNoTests` para os ficheiros em *stage*.
  - [ ] Configurar o hook `pre-push`: Executar o comando total `npm run test:all`.

- [ ] **Passo 4: Integração Contínua e Relatórios (GitHub Actions)**
  - [ ] Criar o workflow `.github/workflows/ci.yml`.
  - [ ] Adicionar um step para chamar a API do Neon (via Neon CLI ou Action) e criar um *Database Branch* temporário.
  - [ ] Executar o `vitest run --coverage` e abortar o Pipeline (Failed) caso o coverage reporte `< 80%`.
  - [ ] Adicionar um step de "Upload Artifacts" gravando as pastas de HTML do Coverage e os Traces do Playwright na plataforma do GitHub.
