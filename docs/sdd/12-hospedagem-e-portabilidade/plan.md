# Plano Tático - Portabilidade, Docker e CI/CD

Este plano cobre as modificações na base de código necessárias para garantir independência de provedores de Cloud.

- [ ] **Passo 1: Next.js Standalone Build**
  - [ ] Alterar o `next.config.js` e adicionar a diretriz `output: "standalone"`.
  - [ ] Testar localmente a compilação com `npm run build` e verificar se a pasta `.next/standalone` foi gerada corretamente.

- [ ] **Passo 2: Criação do Ficheiro Dockerfile**
  - [ ] Criar o `Dockerfile` na raiz baseado num processo "Multi-Stage Build" (Alpine).
  - [ ] **Stage 1 (Deps):** Instalar dependências base de SO (libc6-compat) e executar `npm ci`.
  - [ ] **Stage 2 (Builder):** Copiar o código, passar as Variáveis de Ambiente e correr o `npm run build`.
  - [ ] **Stage 3 (Runner):** Configurar o ambiente final copiando apenas o necessário da pasta `standalone`, expor a porta `3000` e arrancar via `node server.js`.
  - [ ] Criar o ficheiro `.dockerignore` espelhando o `.gitignore`.

- [ ] **Passo 3: Orquestração Base para Produção**
  - [ ] Criar `docker-compose.prod.yml` que sobe a imagem Docker e permite injeção nativa de um ficheiro `.env` global, viabilizando o uso do **Coolify** ou **Render**.

- [ ] **Passo 4: Automação GitHub Actions (Opcional - Deploy Automático)**
  - [ ] Adicionar um ficheiro `.github/workflows/deploy.yml`.
  - [ ] Configurar para efetuar login num Registry (DockerHub ou GitHub Container Registry - GHCR) sempre que houver *merge* na branch `main`.
  - [ ] Executar o *Push* da imagem pré-compilada, acionando o Webhook final do servidor VPS para descarregar e substituir o contêiner (Zero-Downtime Deployment).
