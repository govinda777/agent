# Playbook do Desenvolvedor: Expandindo o Sistema

Este guia explica como adicionar novas funcionalidades seguindo os padrões CQRS e Event Sourcing da arquitetura 2026.

## 1. Adicionando um Novo Comando (Write Side)

1.  **Crie a Interface do Comando:**
    - Vá para `src/modules/[dominio]/commands/`
    - Defina uma interface que estenda `ICommand`.
2.  **Implemente o Handler:**
    - Crie uma classe que implemente `ICommandHandler`.
    - Realize validações de negócio.
    - Persista o evento resultante usando `EventStore.append()`.

## 2. Adicionando uma Nova Projeção (Read Side)

1.  **Crie o Handler de Projeção:**
    - Vá para `src/modules/[dominio]/projections/`
    - Crie uma função de inicialização que assine o `eventBus`.
2.  **Atualize o Banco de Dados:**
    - Utilize `getPrismaWithRLS(event.tenantId)` para garantir que a atualização seja isolada.
3.  **Lembrete:** Projeções podem atualizar tanto o Postgres (Read Models) quanto o Redis (Edge Cache).

## 3. Garantindo o Isolamento de Dados

- **Sempre** utilize o header `x-tenant-id` nas suas requisições de API.
- Nas API Routes, use `requireAuth(request)` para obter a instância do banco com RLS.
- Nunca faça queries globais sem passar pelo mecanismo de RLS, a menos que seja uma operação administrativa global explicitamente documentada.

## 4. Testando

- Execute `npm run test:unit` para validar a lógica de domínio.
- Utilize o branch `feat/...` para desenvolver e verifique se o Proxy da Edge está roteando corretamente para o seu novo contexto.
