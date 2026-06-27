# language: pt
Funcionalidade: Chat com o Agente n8n

  Cenário: Conversar com o agente padrão e obter resposta
    Dado que o usuário está autenticado no sistema
    E existe o agente padrão configurado no banco de dados
    Quando o usuário navega para a página "/d1b00000-0000-0000-0000-000000000000/onboarding"
    E clica no botão "Falar" do agente "Agente n8n Padrão"
    E digita "Olá!" no campo de mensagem
    E clica no botão de enviar
    Então o chat deve renderizar a resposta do agente contendo "Olá!"
