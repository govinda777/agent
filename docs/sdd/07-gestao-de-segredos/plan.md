# Plano Tático - Gestão de Segredos (Integration Vault)

Este plano operacionaliza a criptografia em repouso e a segurança multilocatária de integrações externas.

- [ ] **Passo 1: Modelagem e Banco de Dados**
  - [ ] Adicionar o modelo genérico `TenantIntegration` ao Prisma Schema.
  - [ ] Garantir restrição `@@unique([tenantId, provider])`.
  - [ ] Executar migration (`npx prisma migrate dev`).
- [ ] **Passo 2: Motor de Criptografia AES-GCM**
  - [ ] Configurar variável `ENCRYPTION_MASTER_KEY` no `.env`.
  - [ ] Criar o utilitário `src/lib/encryption.ts` importando `crypto`.
  - [ ] Implementar a função `encrypt(data: object)` que retorna o buffer cifrado + IV + AuthTag.
  - [ ] Implementar a função `decrypt(encryptedData)` que reconstrói a string em JSON.
- [ ] **Passo 3: Frontend e API de Persistência (Zero-Exposure)**
  - [ ] Criar a rota de API `POST /api/integrations` para receber credenciais da UI.
  - [ ] Antes de salvar no Prisma, passar os dados pela função `encrypt()`.
  - [ ] Criar rota de leitura `GET /api/integrations` que retorna apenas máscaras visuais (ex: `****EAAB`). Nunca expor em plain-text.
- [ ] **Passo 4: Injeção de Contexto no LangChain (Stateless)**
  - [ ] Alterar o `AgentExecutor` na rota de Chat. Antes de chamar a LangChain, ler o Vault do banco de dados e passar pelo `decrypt()`.
  - [ ] Injetar o JSON resultante no parâmetro `configurable` das opções do Langchain.
  - [ ] Refatorar a classe `WhatsAppTool` para ler suas credenciais obrigatoriamente do objeto `this.config.configurable`, sem armazenar estado da classe ou arquivo `.env`.
