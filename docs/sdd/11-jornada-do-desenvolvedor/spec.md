# 11. Jornada do Desenvolvedor (DX) e Ambiente Local

A Developer Experience (DX) é fundamental para garantir a escalabilidade técnica do produto. Um programador deve ser capaz de clonar o repositório, subir a infraestrutura inteira na sua própria máquina e conseguir commitar sem depender de internet constante, de cartões de crédito para testar Stripe, ou de chaves de API pagas (como a OpenAI).

## 11.1 Isolamento e Orquestração Local (Docker)

O projeto depende de serviços da nuvem (Neon DB, Stripe, Helicone). Contudo, o ambiente local é desenhado para mimetizar estas camadas usando contêineres e falsificações (mocks).

* **Banco de Dados Local:** Em vez de bater no Neon DB remotamente (o que causa latência e conflito entre os devs da equipa), a raiz do projeto terá um ficheiro `docker-compose.yml` instanciando um PostgreSQL genérico na porta `5432`.

* **Stripe Local:** O fluxo de webhook de faturação do Stripe não funcionaria sem internet, logo, usaremos a **Stripe CLI** integrada num comando de arranque local. Ela permite reencaminhar webhooks falsos (ex: `stripe trigger checkout.session.completed`) diretamente para o `localhost:3000/api/webhooks/stripe`.

## 11.2 Seeding Dinâmico (Prisma)

Trabalhar na UI sem dados (Dashboard vazio) exige criar uma nova conta e Agente manualmente todos os dias. Isso quebra o fluxo de trabalho.

A plataforma exige a existência de um ficheiro `prisma/seed.ts`. O objetivo deste script é:

1. Povoar automaticamente a tabela `tenants` com um "Tenant de Teste" cujo estatuto (`is_active`) seja verdadeiro e o Plano ativado (`Pro`).

2. Gerar "Agentes Mockados" populando a tabela de agentes.

3. Injetar tokens falsos no Integration Vault (Cofre).

**Comando Ágil:** O dev apenas correrá `npm run db:reset`, e o sistema apagará o DB local, correrá as migrations e preencherá a *Seed*, permitindo trabalhar na UI de Dashboard num piscar de olhos.

## 11.3 Mock de Rede Obrigatório (MSW Offline)

Para programar sem internet ou sem chaves reais da OpenAI/Pinecone:
O Mock Service Worker (MSW) que configurámos para os Testes (ver Módulo 10) será reaproveitado no **Ambiente de Desenvolvimento (Dev Mode)**.

Ao arrancar a aplicação via `npm run dev:mock`, o MSW interceta as chamadas `fetch` a `api.helicone.ai` e `api.pinecone.io` feitas a partir do backend Node e retorna sucesso com respostas estáticas (`200 OK`). O dev valida que a regra de negócio e os componentes React se comportaram bem sem gastar nenhum cêntimo com APIs Cloud.

## 11.4 Padrões da Esteira (Code Quality & Commits)

Um código limpo facilita Code Reviews automáticas e a geração de Changelogs no CI/CD. Todo o ambiente dev imporá as seguintes convenções antes de permitir que o código seja consolidado num commit:

* **Conventional Commits:** O projeto usa o `commitlint`. Qualquer mensagem de commit tem de obedecer à semântica estrutural, ex: `feat: add stripe integration`, `fix: auth timeout`, `docs: update SDD`. Mensagens como "corrigi um erro" serão bloqueadas na origem (`husky pre-commit`).

* **Formatação Global:** `Prettier` e `ESLint` farão as correções automáticas (*auto-fix*) sempre que o programador guardar o ficheiro e, como redoma de segurança, atuarão no momento do `pre-commit` por meio da dependência `lint-staged`.
