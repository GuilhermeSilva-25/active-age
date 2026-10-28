# 🧑‍💻 Casos de Uso (UML) - Active Age

Este documento lista as principais interações dos Atores com o sistema Active Age, descrevendo o comportamento esperado para cada fluxo.

## 👥 Atores do Sistema
* **Paciente / Cuidador:** Busca médicos, agenda e paga consultas, realiza teleconsultas, acessa o histórico, gerencia seu perfil/endereço/cuidador e faz download de documentos médicos.
* **Médico Geriatra:** Paga sua assinatura, gerencia agenda, edita perfil profissional, realiza teleconsultas, registra prontuários e emite receitas, pedidos de exames e atestados.
* **Administrador:** Gerencia a plataforma, valida credenciais médicas (CRM) e monitora a segurança do ambiente.

## 📋 Lista de Casos de Uso (UC)

### Fluxo de Acesso, Segurança e Identidade
* **UC01 - Cadastrar-se na Plataforma:** Registro de novos usuários distinguindo perfis, com aceite obrigatório da LGPD.
* **UC02 - Autenticar-se (Login):** Acesso seguro ao painel do perfil.
* **UC03 - Submeter Documentos (CRM):** Médico envia foto do CRM/RQE para habilitar atendimento.
* **UC04 - Validar Perfil de Médico:** Administrador aprova ou reprova médicos cadastrados.
* **UC05 - Bloquear/Suspender Usuário:** Moderação de contas pelo Administrador.
* **UC18 - Manter Perfil de Usuário:** Atualização de foto de perfil (avatar), dados cadastrais, informações de atendimento (médico: mini-bio, foco clínico, valor da consulta e duração) e dados de apoio familiar/emergência (paciente: endereço residencial e contato do cuidador responsável).

### Fluxo Financeiro
* **UC06 - Processar Pagamento de Consulta:** Paciente efetua o pagamento integrado no momento da confirmação do agendamento.
* **UC07 - Gerenciar Assinatura:** Médico realiza o pagamento e gerencia a mensalidade para manter seu "consultório virtual" ativo.

### Jornada de Agendamento
* **UC08 - Buscar Médico Geriatra:** Pesquisa inteligente de profissionais ativos e validados.
* **UC09 - Agendar Teleconsulta:** Seleção de horário que aciona o bloqueio de agenda após o pagamento.
* **UC10 - Gerenciar Agenda:** Visualização, reagendamento e cancelamento de consultas (respeitando regra de 24h).
* **UC11 - Submeter Exames Prévios:** Paciente faz upload de laudos antigos para análise do médico.

### Teleconsulta e Gestão Clínica
* **UC12 - Realizar Teleconsulta:** Conexão de vídeo/áudio segura no horário agendado.
* **UC13 - Acessar Exames do Paciente:** Médico visualiza exames submetidos previamente pelo paciente.
* **UC14 - Registrar Prontuário Eletrônico:** Médico finaliza a anamnese e evolução clínica, garantindo a imutabilidade do registro.
* **UC15 - Emitir Documentos Médicos:** Médico gera e assina digitalmente Receitas, Pedidos de Exames e Atestados.
* **UC16 - Baixar Documentos Médicos:** Paciente acessa seu painel e faz download (PDF) de receitas, pedidos de exame e atestados.
* **UC17 - Avaliar Consulta:** Paciente deixa nota e comentário sobre o atendimento geriátrico.
