# 6. Canais Externos e Segurança

Construir o "cérebro" não tem muito valor se ele não puder conversar com ninguém. Esta arquitetura foi montada para ser "Agnóstica de Canal" — O mesmo Agente atende WhatsApp, Telegram, ou Webchats nativos usando a exata mesma lógica de core.

## 6.1 Integração Omnichannel

As APIs devem ser desenvolvidas com uma estrutura que uniformiza e agrupa a conversação independentemente de onde a requisição originou. O `API_Chat` que processa Langchain só aceita strings puras (uma mensagem do usuário) e retorna strings puras.

### O Fluxo Multi-Canal

* **WhatsApp:** Nós usamos provedores como a Meta Cloud API (Webhooks) ou Twilio. Quando o cliente final manda uma mensagem "Bom dia" pelo zap, nosso webhook a recebe, a "limpa" para remover metadados desnecessários da Meta, e encaminha a string "Bom dia" e um ID do telefone do remetente para a Engine de Chat interna.

* **WebWidget:** Nós fornecemos um `<script>` em javascript que os Tenants colocam em seus sites (ex: via iframe). O frontend em React passa a string direto para o mesmo backend.

* **Armazenamento de Sessão:** A gestão de histórico de chat usa o "Telefone" ou "ID do Cliente no site" como SessionID, mantendo a conversa coerente entre mensagens assíncronas do mesmo usuário.

## 6.2 Segurança e Compliance

### Camada de Rede

* Toda requisição transita usando HTTPS/SSL obrigatório (nativamente fornecido pelo provedor Next.js/Vercel).

* Rotas de backend protegidas contra requisições cruzadas indevidas (CORS estrito).

### Camada de Autenticação de Tenants

* Toda a gestão (criação, leitura de painel, uploads) usa Tokens JWT emitidos pelo Privy.

* A plataforma implementa `Row-Level Security` (RLS) lógicas (por conta de ORMs) nas queries do PostgreSQL, atestando sempre que o registro do Agente que o usuário tenta editar pertences de fato ao JWT recebido no Header de autorização da requisição HTTP.

### Camada de Integridade das LLMs

* **System Prompt Hardcoding:** Tenants têm o poder de inserir instruções iniciais aos agentes. Nós validamos e encapsulamos os `System Messages` do Langchain isoladamente dos `Human Messages` das requisições públicas para limitar os ataques de injeção de Prompt (Prompt Injection) contra nossa API principal e prevenir exfiltração de dados sensíveis.
