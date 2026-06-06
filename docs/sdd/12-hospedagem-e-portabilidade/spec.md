# 12. Hospedagem, Colaboração e Portabilidade (Evitando Vendor Lock-in)

Um dos maiores desafios de arquiteturas construídas em Next.js é a dependência excessiva do ecossistema da Vercel. Embora seja excelente para prototipagem solitária, assim que o projeto abre para colaboração ou exige processamento pesado contínuo, a estrutura de custos e bloqueios (Lock-in) torna-se um fardo para o modelo de negócios SaaS.

## 12.1 O Paradoxo da Colaboração na Vercel

* **A Barreira (O Custo da Colaboração):** Se a plataforma for alojada nativamente na Vercel no plano "Hobby" (Gratuito), o repositório Github não pode pertencer a uma Organização, e a adição de colaboradores que efetuem Commits para a plataforma desencadeia um bloqueio por parte da Vercel.

* **A Consequência:** Para permitir que dois ou mais desenvolvedores façam *deploy* do projeto, a Vercel exige imediatamente o upgrade para o **Plano Pro (US$ 20 / utilizador / mês)**. Além disso, as "Edge/Serverless Functions" na Vercel têm limites estritos de tempo de execução (timeouts), o que pode cortar a meio respostas demoradas de LLMs (RAG) em planos básicos.

Para solucionar isso, a arquitetura exige o desenvolvimento sob a premissa de **Agnosticismo de Infraestrutura via Docker**.

## 12.2 Alternativas de Hospedagem

O projeto deve ser escrito de forma a ser perfeitamente executável em qualquer uma destas três infraestruturas:

### Opção A: Render ou DigitalOcean App Platform (PaaS)

* **Como Funciona:** Em vez de depender de funções Serveless proprietárias, a aplicação corre num contentor Docker alojado num ambiente "Platform as a Service". O Render conecta-se ao Github e compila a imagem automaticamente sempre que a `main` recebe novos commits (independentemente de quem os fez).

* **Vantagens:** Escalabilidade vertical fácil, sem custos ocultos "por programador", sem "timeouts" arbitrários em *long-running tasks* (agentes de IA a pensar durante 30+ segundos).

* **Custos Previstos:** ~$7 a $20/mês, independente do tamanho da equipa de desenvolvimento.

### Opção B: VPS Próprio com Coolify / Dokku (Soberania Total)

* **Como Funciona:** Aluga-se um Servidor Virtual Dedicado (VPS) em provedores baratos como Hetzner, Contabo ou DigitalOcean Droplets. Instala-se o **Coolify** (uma alternativa Open-Source à Vercel que corre no próprio servidor do utilizador).

* **Vantagens:** O custo é puramente da "chapa" do servidor. Com US$ 10 mensais, obtêm-se servidores que aguentam centenas de clientes em simultâneo. Pode hospedar bases de dados, workers e repositórios paralelos na mesma máquina sem pagar extra por nenhum serviço periférico.

* **Complexidade:** Requer um pouco mais de configuração inicial de infraestrutura e gestão de certificados SSL (mas painéis como o Coolify abstraem 95% do trabalho).

### Opção C: Vercel (MVP Solitário)

* **Apenas se:** O projeto for operado exclusivamente por um único fundador que não pretende partilhar a codebase durante toda a Fase 1.

## 12.3 A Estratégia de Containerização (Docker Standalone)

Para que o código fonte consiga fluir suavemente da Vercel para o Render ou para um VPS da Hetzner amanhã, o Next.js tem de ser forçado a compilar no modo **Standalone**.

O modo Standalone analisa o projeto e empacota apenas os módulos estritamente necessários (`node_modules`) numa mini-pasta autossuficiente que é injetada numa Imagem de Docker Alpine minimalista (~150MB a 300MB). Esta imagem tem lá dentro o seu próprio servidor Web NodeJS (`server.js`), sendo completamente ignorante quanto à Cloud onde está a rodar.
