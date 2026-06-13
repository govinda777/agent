# language: pt
Funcionalidade: Jornada de Checkout e Upgrade de Plano

  Cenário: Realizar checkout com sucesso e remover botões de upgrade
    Dado que o usuário está autenticado no sistema
    E existe o tenant correspondente no banco de dados com plano gratuito
    Quando o usuário navega para a página "/onboarding"
    Então o banner de upgrade "Fazer Upgrade Agora" deve estar visível
    E o botão "Upgrade para Pro" na barra de navegação deve estar visível
    Quando o usuário clica no botão "Fazer Upgrade Agora"
    Então o usuário deve ser redirecionado para a página "/checkout"
    Quando o usuário inicia o processo de pagamento seguro
    Então o usuário deve ser redirecionado para a página de sucesso
    E o banner de upgrade "Fazer Upgrade Agora" não deve mais estar visível
    E o botão "Upgrade para Pro" na barra de navegação não deve mais estar visível
