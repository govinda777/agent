# Plano Tático - Testes de Benchmark e Performance

Este plano operacionaliza a implementação dos testes de benchmark para mapear, mensurar e corrigir gargalos de performance no projeto.

- [ ] **Passo 1: Instalação e Configuração das Ferramentas de Performance**
  - [ ] Validar suporte a benchmarks nativos no Vitest (`vitest bench`).
  - [ ] Configurar scripts de teste de carga no `package.json` utilizando o `autocannon` ou `k6`.
  - [ ] Instalar e testar localmente as ferramentas do `clinic` (`npm i -D clinic` ou executável global).

- [ ] **Passo 2: Micro-Benchmarks de Criptografia (`src/lib/crypto.ts`)**
  - [ ] Criar o arquivo de benchmark de CPU `src/__tests__/crypto.bench.ts`.
  - [ ] Mapear o custo atual de `crypto.scryptSync` sob concorrência e loops quentes.
  - [ ] Testar alternativas de otimização (uso de Cache LRU de chaves, derivação assíncrona com `crypto.scrypt` ou Workers).

- [ ] **Passo 3: Testes de Carga na API de Gateway e Chat (`/api/agents/chat`)**
  - [ ] Criar um script básico de teste em `docs/sdd/14-Benchmarks-test/load-test.js` utilizando Autocannon.
  - [ ] Mockar a resposta HTTP do n8n para responder com latências variáveis (100ms, 1s, 5s) a fim de simular o comportamento real de integrações.
  - [ ] Executar testes de concorrência com 10, 50 e 100 conexões simultâneas locais e mapear o tempo de resposta máximo (p99).

- [ ] **Passo 4: Monitoramento do Prisma e Banco de Dados**
  - [ ] Configurar Logs de Query no Prisma Client para identificar tempos de execução de queries em ambiente de teste de concorrência.
  - [ ] Benchmark do método `incrementExecutions` sob múltiplas chamadas simultâneas do mesmo tenant para mapear contenção de escrita.

- [ ] **Passo 5: Geração de Relatórios e Alertas**
  - [ ] Criar scripts de automatização para gerar logs e gráficos de chama (Flamegraphs) usando `clinic flame` durante o teste de carga.
  - [ ] Definir limites de aceitação de latência (performance budgets) para impedir deploys que adicionem lentidão excessiva.
