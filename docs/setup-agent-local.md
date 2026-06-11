# Guia de Configuração Local do Agente n8n

Este guia detalha passo a passo como configurar e vincular um novo agente local rodando Next.js ao seu ambiente n8n local na página **[http://localhost:3000/agents/new](http://localhost:3000/agents/new)**.

---

## 🛠️ Pré-requisitos
Certifique-se de que o ambiente de desenvolvimento completo está rodando localmente:
1. O Docker Desktop deve estar aberto.
2. O projeto Next.js e a infraestrutura local devem estar ativos. Caso não estejam, execute:
   ```bash
   task dev
   ```

---

## 🚀 Passo a Passo

> 💡 **Automação Ativa**: O ambiente local foi configurado para **importar automaticamente** um fluxo padrão de agente no n8n na inicialização. Quando você rodar `task dev`, o n8n já subirá com o workflow chamado **"Default Agent Workflow"** criado e ativo!

### 1. Verificar o Fluxo e Webhook no n8n Local
1. Acesse o painel do n8n local em seu navegador: **[http://localhost:5678](http://localhost:5678)**.
2. Você verá o fluxo **"Default Agent Workflow"** na sua lista de fluxos. Abra-o.
3. Clique duas vezes no nó **Webhook** para ver suas propriedades.
4. Você verá a URL gerada pelo n8n em **Webhook URLs**:
   * O caminho padrão do webhook é `agent-webhook`.
   * A URL de produção ativa é: `http://localhost:5678/webhook/agent-webhook`.
5. Se preferir criar outro fluxo do zero:
   * Crie um novo fluxo e adicione o nó **Webhook**.
   * Configure o método HTTP como `POST`.
   * Escolha o Path identificador (ex: `agent-webhook`).

---

### 2. Copiar a URL de Webhook do n8n
Dentro do nó Webhook configurado no n8n:
1. Clique no link **"Webhook URLs"** logo acima do parâmetro Path.
2. Você verá duas abas:
   * **Test**: Usado para fins de teste e desenvolvimento. A URL gerada será parecida com:
     `http://localhost:5678/webhook-test/agent-webhook`
   * **Production**: Usado após o fluxo ser ativado. A URL gerada será parecida com:
     `http://localhost:5678/webhook/agent-webhook`
3. Copie a URL desejada (recomenda-se iniciar com a URL de **Test** para validação em tempo real).

---

### 3. Configurar o Novo Agente no App Next.js
Acesse a página de criação de agentes em: **[http://localhost:3000/agents/new](http://localhost:3000/agents/new)**.

Preencha os campos da seguinte forma:
1. **Nome do Agente**: Dê um nome descritivo para o seu agente (ex: *Suporte Comercial*).
2. **Webhook URL do n8n**: Cole a URL que você copiou no **Passo 2** (ex: `http://localhost:5678/webhook-test/agent-webhook`).
3. **Auth Token do n8n**: Defina uma chave secreta de autenticação de sua preferência (ex: `chave_secreta_do_meu_agente`).
   * **Como funciona a Autenticação**:
     Quando a aplicação chama o seu webhook do n8n, ela envia a requisição HTTP com o seguinte cabeçalho de autenticação:
     ```http
     X-API-KEY: <seu_token_configurado>
     ```
     Desta forma, você pode configurar o nó **Webhook** do n8n para validar esse token (ex: configurando o campo **Authentication** do Webhook para *Header Auth* com o nome `X-API-KEY` e o valor correspondente ao seu token).

---

### 📦 Estrutura do Payload enviado ao n8n
Quando o usuário interagir no chat do seu agente, a aplicação enviará um POST para a URL do seu webhook do n8n contendo o seguinte corpo JSON:

```json
{
  "message": "Olá, como você funciona?",
  "channel": "web",
  "_agentId": "uuid-do-agente",
  "_channel": "web",
  "_llmProvider": "openai",
  "_llmApiKey": "sua-chave-api-descriptografada-se-houver"
}
```

---

### 4. Como Testar e Validar no n8n
1. No painel do n8n, dentro do seu fluxo recém-criado, clique em **"Listen for test event"** (ou *Execute workflow*) para deixar o webhook escutando requisições temporariamente.
2. Interaja com o widget de chat do agente criado na interface do Next.js.
3. O n8n receberá um payload JSON contendo a mensagem do usuário e os cabeçalhos de autenticação contendo o seu **Auth Token**.
4. Valide a requisição no n8n e continue construindo o fluxo inteligente do seu agente!
