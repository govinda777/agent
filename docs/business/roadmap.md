# Roadmap e Limitações

Este documento descreve o estado atual do projeto, suas limitações conhecidas e os planos para futuras melhorias.

## Limitações Conhecidas

Atualmente, o sistema possui as seguintes limitações:

- ⚠️ **Profundidade de Crawling Limitada**: O crawler está configurado para uma profundidade baixa para evitar sobrecarga em servidores externos e custos excessivos de API.
- ⚠️ **Sem Suporte Multi-idioma Nativo**: Embora o LLM possa entender vários idiomas, a lógica de processamento e alguns splitters são otimizados para um único idioma por vez.
- ⚠️ **Janela de Contexto Fixa**: O contexto recuperado é limitado a aproximadamente 3000 tokens para garantir que caiba no prompt do modelo e mantenha os custos sob controle.
- ⚠️ **Sem Autenticação/Autorização**: O sistema atual é um template aberto e não possui camadas de segurança para proteger a base de conhecimento ou restringir o acesso ao chat.
- ⚠️ **Processamento Síncrono de Ingestão**: Grandes volumes de dados podem causar timeouts em ambientes serverless durante a fase de embedding e upsert.

## Roadmap

### Q3 2025: Melhorias de Infraestrutura e Custo
- [ ] **Suporte Multi-tenancy**: Implementar isolamento por usuário/organização usando Namespaces do Pinecone de forma dinâmica.
- [ ] **Cache de Embeddings**: Implementar uma camada de cache (Redis) para evitar re-processamento de conteúdos idênticos, reduzindo custos de API da OpenAI.
- [ ] **Interface de Gerenciamento de Conhecimento**: Criar um dashboard para visualizar, editar e excluir documentos indexados sem necessidade de chamadas manuais de API.

### Q4 2025: Inteligência e Conectividade
- [ ] **Integração com Fontes Estruturadas**: Adicionar suporte para indexação de dados vindos de SQL, Google Drive e Notion.
- [ ] **Fine-tuning Opcional**: Permitir que usuários treinem modelos específicos para domínios técnicos muito fechados.
- [ ] **A/B Testing de Prompts**: Implementar ferramenta para comparar o desempenho de diferentes system prompts e configurações de Top-K.

### Q1 2026: Escala e Analytics
- [ ] **Analytics Dashboard**: Visualizar métricas de performance (latência, tokens usados) e qualidade (satisfação do usuário, cobertura de perguntas).
- [ ] **Processamento em Background**: Mover a ingestão de arquivos pesados para filas (Queues) para suportar grandes volumes de dados sem timeouts.
