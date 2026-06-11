This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## 🚀 Rodando o Projeto Localmente

O projeto utiliza o **Taskfile** (`go-task`) para simplificar e automatizar o setup do ambiente. O Taskfile orquestra a criação do arquivo `.env`, sobe o Docker Compose (banco de dados, n8n, mocks), instala dependências e inicia o Next.js com um único comando.

### 1. Pré-requisitos
Antes de começar, certifique-se de que tem instalado na sua máquina:
- **[Node.js](https://nodejs.org/en/)** (recomendado usar a versão LTS)
- **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** ou Docker rodando
- **[Task](https://taskfile.dev/installation/)** (Instale executando `npm install -g @go-task/cli` ou siga o [guia de instalação oficial](https://taskfile.dev/installation/))

### 2. Iniciando o ambiente

No terminal da raiz do projeto, execute:

```bash
task dev
```

Este comando irá automaticamente:
1. Copiar o `.env.example` para `.env` e adicionar a `DATABASE_URL` local.
2. Baixar as dependências do `npm`.
3. Iniciar a infraestrutura via `docker compose up -d`.
4. Rodar as migrações/criações de tabelas através do `prisma db push`.
5. Subir o servidor de desenvolvimento Next.js.

Abra [http://localhost:3000](http://localhost:3000) no seu navegador para ver o resultado!

### Outros comandos disponíveis
Se quiser rodar os passos individualmente, você pode usar:
- `task infra`: Para subir apenas os containers do Docker.
- `task db`: Para forçar a execução das migrações do banco.
- `task --list`: Para ver todas as tarefas disponíveis.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
