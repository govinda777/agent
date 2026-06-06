# 10. Estratégia de Testes, Qualidade e TDD

Para que a plataforma nasça escalável, estável e livre de regressões que afetem o faturamento (Stripe) ou a operação (Helicone/n8n), o ciclo de desenvolvimento será guiado pelo **Test-Driven Development (TDD)** e por rigorosas práticas de validação de qualidade contínua.

## 10.1 A Pirâmide de Testes e a Stack

A arquitetura define que o projeto deve possuir alta cobertura, usando ferramentas modernas para assegurar performance na execução.

### Stack Principal

* **Testes de Unidade e Integração:** `Vitest` (Rápido, nativo para ESM e integrado ao ecossistema Next.js/Vite).

* **Mocks de Serviços Terceiros:** `MSW` (Mock Service Worker). Todo tráfego HTTP que sai para a Stripe, Helicone, n8n ou Privy deve ser interceptado e mockado a nível de rede para evitar *flaky tests* e não poluir as APIs reais de teste.

* **Testes Ponta-a-Ponta (E2E):** `Playwright` (Testa as jornadas do utilizador desde o UI até ao banco de dados).

### Regra de Cobertura (Coverage)

O pipeline CI/CD (GitHub Actions) bloqueará **automaticamente** qualquer Pull Request ou Deploy se o *Coverage* global de testes cair **abaixo de 80%**.

## 10.2 Dupla Estratégia de Banco de Dados

Testes exigem velocidade, mas também precisam de refletir o ambiente de produção. Teremos duas abordagens distintas para o Prisma ORM dependendo da fase do pipeline:

1. **Testes de Unidade (Prisma Mock):** O ficheiro `prisma` será mockado via `vitest-mock-extended`. As funções de repositório serão testadas rapidamente (em milissegundos) simulando o que o banco responderia. Isso garante agilidade extrema para o *pre-commit*.

2. **Testes de Integração (Neon DB Branching):** Em testes complexos executados nas Pull Requests, usaremos a funcionalidade **Database Branching** do Neon. Cada PR criará temporariamente um "clone/branch" do banco de dados em segundos, fará a migração limpa, correrá os testes reais (verificando Constraints, Foreign Keys de Tenants e RLS), e em seguida destruirá o banco, não deixando rastos nem custos excessivos.

## 10.3 Eficiência na Execução (Git Hooks)

Não basta ter testes, eles devem ser fáceis de rodar. Para não travar a produtividade, dividimos o esforço transacional usando o `Husky`.

### 1. Pre-Commit (Rápido e Isolado)

* **Objetivo:** Fornecer feedback instantâneo ao *dev* e garantir que código quebrado nem sequer seja versionado.

* **Execução:** Quando o *dev* faz `git commit`, o Husky aciona apenas os **Testes de Unidade** (via Vitest com Prisma Mock), correndo em paralelo nos ficheiros afetados.

* **Tempo esperado:** Menos de 5 segundos.

### 2. Pre-Push (Pesado e Abrangente)

* **Objetivo:** Evitar que código defeituoso chegue ao repositório remoto.

* **Execução:** Ao fazer `git push`, executam-se os **Testes de Integração**.

## 10.4 Relatórios de Qualidade Contínua (Artefactos)

A qualidade precisa ser visível para todos os stakeholders.

* Sempre que os testes correrem via Pipeline CI/CD, o sistema gerará um **Relatório de Qualidade Atualizado**.

* **O que o relatório contém:** HTML interativo de *Coverage* (via *v8* ou *istanbul* no Vitest) e o Relatório Visual de E2E do Playwright.

* **Armazenamento:** Esses artefactos serão consolidados e guardados (ex: pasta `coverage/` localmente ou no repositório de Artifacts do GitHub Actions). Esta será a última "evidência" comprovando o nível de saúde do projeto, sendo consultada sempre que houver suspeita de quebras ou degradação na arquitetura.
