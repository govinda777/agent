# Guia de Monitoramento e Operação

Este documento detalha o processo de monitoramento e operação do sistema de chatbot com RAG.

## Monitoramento Técnico

Para garantir que o sistema está operando corretamente, monitore as seguintes áreas:

### 1. Console do Pinecone
- **Status do Índice**: Verifique se o índice está ativo e pronto.
- **Número de Vetores**: Monitore o crescimento da base de conhecimento conforme novos conteúdos são indexados.
- **Latência de Consulta**: Observe o tempo de resposta das buscas vetoriais.

### 2. Dashboard da OpenAI
- **Uso de API**: Monitore o consumo de tokens para embeddings e chat para evitar interrupções por limites de cota ou falta de créditos.
- **Erros de API**: Fique atento a erros de limite de taxa (Rate Limit) ou indisponibilidade do serviço.

### 3. Vercel Analytics (Se implantado)
- **Latência P95**: Verifique se a latência da primeira resposta está abaixo de 2 segundos.
- **Taxa de Erro**: Monitore erros 500 ou 404 nos endpoints de API.
- **Log de Funções**: Analise logs em tempo real para identificar falhas de rede ou de integração.

## Monitoramento de Qualidade (KPIs)

### Métricas de Negócio Recomendadas

- **Taxa de Resolução**: % de perguntas respondidas com sucesso pelo chatbot sem intervenção humana.
- **Score de Similaridade Médio**: Monitorar se os documentos recuperados têm scores consistentemente acima de 0.7.
- **Feedback do Usuário**: Coletar "thumbs up/down" para avaliar a utilidade das respostas.
- **Custo por Query**: Calcular o custo médio de cada interação (embedding + geração) para controle de orçamento.

## Manutenção de Rotina

- **Limpeza de Base**: Utilize o endpoint `/api/clearIndex` para remover dados obsoletos de um namespace.
- **Re-indexação**: Periodicamente, atualize conteúdos crawleados para garantir que o chatbot tenha as informações mais recentes.
- **Otimização de Prompt**: Ajuste as instruções do sistema no arquivo `src/app/api/chat/route.ts` com base no feedback dos usuários.
