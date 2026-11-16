# Conversas manuais pelo WhatsApp

Disponível em todos os planos para usuários que já têm permissão de consultar o cliente. A ficha e os detalhes do atendimento exibem um link quando há telefone brasileiro válido. O atendimento também abre a ficha específica do cliente.

O link abre wa.me em outra aba, com noopener/noreferrer. Abrir o contato não envia mensagem. Não há integração Meta, credenciais, webhook, automação ou cobrança de franquia nessa função. O backend mantém whatsappEnabled=false. A área de configurações informa conversa manual, sem promessa de ativação futura.

O gerador compartilhado aceita números nacionais de 10/11 dígitos ou internacionais de 12/13 começando em 55; preserva corretamente o DDD 55, não duplica o código do país e escapa textos opcionais. Telefones ausentes/malformados não produzem links.

Possível evolução (ainda não implementada): modelos de lembrete com variáveis permitidas, validação e prévia. O profissional clica, revisa e envia no aplicativo. Agendamento automático de mensagens exigiria outra solução de integração.
