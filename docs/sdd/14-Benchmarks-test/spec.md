# 14. Testes de Benchmark e Otimização de Performance

Para garantir que a plataforma opere com baixa latência, alta concorrência e uso eficiente de recursos de infraestrutura (especialmente sob concorrência e chamadas externas), a estratégia de otimização de performance do projeto é baseada em testes contínuos de benchmark e perfilamento (profiling) das funções e fluxos críticos.

## 14.1 Objetivos de Performance e Benchmarking

A finalidade desta especificação é formalizar os limites aceitáveis de consumo de CPU, latência de I/O e contenção de banco de dados, estabelecendo uma rotina de testes de stress antes que gargalos cheguem aos ambientes de homologação e produção.

*   **Tempo de Resposta Alvo (API Gateway / Middleware):** < 50ms (excluindo I/O externo).
*   **Tempo de Execução Criptográfica:** < 2ms por operação de decodificação.
*   **Capacidade de Concorrência Local:** Mínimo de 500 requisições/segundo em rotas de proxy.

## 14.2 Mapeamento de Pontos Críticos do Projeto (Gargalos Potenciais)

Com base na arquitetura do sistema, mapeamos quatro pontos prioritários para aplicação de testes de benchmark:

### 1. Camada Criptográfica (`src/lib/crypto.ts`)
*   **O Ponto Crítico:** A função `deriveKey` utiliza `crypto.scryptSync` a cada chamada de criptografia/descriptografia do token de API do usuário.
*   **O Risco:** O `scrypt` é um algoritmo de derivação intencionalmente lento em CPU. Ao executá-lo de forma síncrona na thread principal do Node.js, ele bloqueia o processamento de qualquer outra requisição concorrente.
*   **Foco do Benchmark:** Comparar o tempo de execução e throughput de `scryptSync` por chamada com abordagens de cache em memória das chaves derivadas ou processamento em fila.

### 2. Proxy de Integração com n8n (`src/modules/agents/useCases/ProcessAgentChatUseCase.ts`)
*   **O Ponto Crítico:** A execução do chat faz um `fetch` síncrono enviando payloads para o webhook do n8n e aguarda a conclusão da execução.
*   **O Risco:** Workflows complexos ou com LLM no n8n demoram de segundos a minutos para responder. Manter a conexão HTTP aberta sob alta concorrência esgota os sockets de rede livres (Socket Exhaustion) e atinge limites de timeout da infraestrutura.
*   **Foco do Benchmark:** Medir a latência do gateway do chat simulando diferentes tempos de resposta do webhook do n8n para identificar o ponto de saturação de conexões.

### 3. Persistência de Dados e Contadores Prisma (`src/modules/agents/repositories/...`)
*   **O Ponto Crítico:** A operação de atualizar contadores de execução (`incrementExecutions`) a cada mensagem enviada ao agente.
*   **O Risco:** Sob alto volume de mensagens concorrentes de um mesmo Tenant, escritas diretas concorrentes causam concorrência de trava (*lock contention*) no banco PostgreSQL, reduzindo drasticamente o throughput do banco.
*   **Foco do Benchmark:** Comparar o throughput de transações diretas no banco de dados contra abordagens de buffer em memória (ex: Redis/In-memory Batching).

### 4. Middleware e Roteamento de Segurança (`src/proxy.ts`)
*   **O Ponto Crítico:** Intercepção de todas as rotas protegidas pelo middleware Next.js para leitura e parsing de Cookies.
*   **O Risco:** Operações de regex lentas ou manipulação ineficiente de cabeçalhos de requisição executados em todas as requisições geram latência residual cumulativa no Edge.
*   **Foco do Benchmark:** Validar a latência adicionada em rotas estáticas e dinâmicas pelo processamento do middleware sob carga.

## 14.3 Stack e Ferramental de Benchmark

*   **Micro-Benchmarks (Funções isoladas):** `Vitest Bench` (utilizando internamente a biblioteca `tinybench`) para medir operações por segundo (ops/sec) e tempo médio de execução em nanossegundos diretamente na suíte de testes.
*   **Testes de Carga de API:** `Autocannon` ou `k6` para testar os endpoints de API de ponta a ponta simulando usuários simultâneos.
*   **Perfilamento do Event Loop e CPU:** `Clinic.js` (especialmente `clinic bubbleprof` para monitorar chamadas assíncronas e `clinic flame` para gerar gráficos de chama de uso de CPU).

## 14.4 Metodologia de Execução e Homologação

Os testes de benchmark serão estruturados da seguinte forma:
1.  **Testes de Linha de Base (Baseline):** Medições realizadas no código estável atual para registrar os limites iniciais.
2.  **Testes de Estresse:** Injeção de carga concorrente progressiva até o ponto de falha do microsserviço.
3.  **Relatórios de Regressão de Performance:** Análise comparativa gerada automaticamente ao alterar módulos críticos para garantir que novas features não adicionem latência superior a 10% nas APIs existentes.
