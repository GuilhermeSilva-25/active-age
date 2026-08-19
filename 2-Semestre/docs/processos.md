# 🔄 Modelagem de Processos de Negócio (BPMN)

Este documento descreve os fluxos de trabalho relacionados à jornada de cuidado do paciente idoso, evidenciando a fragmentação do modelo atual e a solução integrada proposta pelo Active Age.

## 1. Processo Tradicional de Consulta Geriátrica (AS-IS)
A jornada atual, manual e desconectada, apresenta múltiplos pontos de atrito para o paciente e para o médico:

* **Busca Descentralizada:** O paciente/cuidador precisa pesquisar clínicas e ligar para vários locais para verificar horários e encontrar um geriatra disponível.
* **Deslocamento Físico e Burocracia:** O paciente deve separar exames físicos, deslocar-se até a clínica, realizar check-in e aguardar na sala de espera.
* **Histórico Fragmentado:** Durante a consulta, o médico realiza a anamnese questionando o histórico do zero e analisa exames físicos em papel trazidos pelo paciente.
* **Gestão Manual:** O médico emite prescrições em papel, e o paciente assume a responsabilidade de guardar essas receitas sem perdê-las.

## 2. Processo de Telessaúde e Gestão Clínica (TO-BE)
O novo fluxo modela o processo operando dentro do Active Age, resolvendo os gargalos anteriores através da centralização de dados e garantindo três melhorias fundamentais:

* **Validação de Segurança:** O sistema filtra e exibe apenas médicos que tiveram suas credenciais verificadas, permitindo que o paciente selecione o horário e confirme o agendamento digitalmente.
* **Jornada Digital:** O sistema registra o agendamento, bloqueia o horário e envia notificações automáticas de confirmação para ambas as partes. No horário marcado, paciente e médico acessam a sala virtual, onde o médico já pode consultar o histórico prévio do paciente.
* **Ciclo Clínico Completo:** O processo não termina com a videochamada. O médico registra a evolução clínica e emite a prescrição digital. O sistema salva o prontuário eletrônico no banco de dados e gera a receita com assinatura digital, disponibilizando-a diretamente no painel do usuário para acesso a qualquer momento.