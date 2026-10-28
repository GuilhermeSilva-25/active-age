# 📋 Documento de Requisitos - Active Age

Este documento detalha as funcionalidades, os atributos de qualidade e as regras de negócio que guiam o desenvolvimento da plataforma Active Age, focada na jornada de telessaúde geriátrica.

## 1. Requisitos Funcionais (RF)
Descrevem as ações e serviços que o sistema deve realizar para atender aos usuários (Pacientes/Cuidadores, Médicos e Administradores).

* **RF001 - Gestão de Identidade:** O sistema deve permitir cadastro e login seguro para todos os perfis, utilizando token JWT.
* **RF002 - Credenciamento Médico:** O sistema deve permitir que médicos submetam comprovantes de habilitação (CRM/RQE) via upload.
* **RF003 - Validação de Perfil:** O sistema deve oferecer um painel para o Administrador aprovar ou reprovar o cadastro de médicos.
* **RF004 - Busca Inteligente:** O sistema deve permitir a busca de médicos aprovados utilizando filtros de especialidade e data.
* **RF005 - Agendamento Online:** O sistema deve exibir a agenda do médico em tempo real e permitir marcação, cancelamento e notificações.
* **RF006 - Upload de Exames Prévios:** O paciente/cuidador deve poder enviar laudos e exames anteriores (PDF, JPG, PNG) para análise médica.
* **RF007 - Teleconsulta Integrada:** O sistema deve prover uma sala de videoconferência nativa e segura para o atendimento.
* **RF008 - Prontuário Eletrônico:** O médico deve poder registrar a evolução clínica (queixa, anamnese, diagnóstico, conduta) durante ou após a consulta.
* **RF009 - Emissão de Documentos Médicos:** O sistema deve permitir ao médico emitir, assinar digitalmente e disponibilizar Receitas Médicas, Pedidos de Exames e Atestados em formato PDF.
* **RF010 - Download de Documentos e Histórico:** O paciente/cuidador deve ter acesso ao histórico clínico e poder baixar os documentos médicos gerados (receitas, atestados e pedidos) em PDF.
* **RF011 - Avaliação de Consulta:** O sistema deve permitir que o paciente avalie o atendimento pós-consulta.
* **RF012 - Pagamento de Consultas:** O sistema deve processar o pagamento da consulta pelo paciente de forma integrada no momento da confirmação do agendamento.
* **RF013 - Gestão de Assinaturas (SaaS):** O sistema deve gerenciar a cobrança recorrente (mensalidade) dos médicos para a utilização do seu "consultório virtual" na plataforma.
* **RF014 - Gestão e Edição de Perfil de Usuário:** O sistema deve permitir que médicos e pacientes atualizem suas informações cadastrais, façam upload de foto de rosto (avatar), configurem dados de atendimento (médico: RQE, mini-bio, áreas de foco, valor de consulta e duração) e dados de apoio familiar/emergência (paciente: endereço residencial completo e contato do cuidador responsável).

## 2. Requisitos Não Funcionais (RNF)
Definem os atributos de qualidade, tecnologia e segurança da plataforma.

* **RNF001 - Acessibilidade:** A interface Front-End deve seguir rigorosamente as diretrizes WCAG 2.1 (Nível AA), com alto contraste e fontes ajustáveis para idosos.
* **RNF002 - Arquitetura Front-End:** O sistema deve operar como uma Single Page Application (SPA).
* **RNF003 - Arquitetura Back-End:** A API RESTful deve ser segura, trafegando dados exclusivamente via protocolo HTTPS/TLS.
* **RNF004 - Persistência Híbrida:** O sistema deve utilizar armazenamento flexível (NoSQL) para os prontuários, garantindo adaptação a diferentes dados médicos.
* **RNF005 - Segurança e LGPD:** Senhas e dados sensíveis de saúde devem possuir criptografia forte (Privacy by Design). O sistema deve manter Logs de Auditoria.
* **RNF006 - Integração de Gateway:** O sistema deve integrar um Gateway de Pagamento seguro para transações financeiras, não armazenando dados brutos de cartão de crédito no banco da plataforma.

## 3. Regras de Negócio (RN)
As "leis" internas que o software deve obedecer.

* **RN001 - Visibilidade Médica:** Um médico só pode receber agendamentos se o seu status for validado como "APROVADO" pelo Administrador.
* **RN002 - Antecedência de Cancelamento:** O cancelamento automático pelo usuário só é permitido com no mínimo 24 horas de antecedência.
* **RN003 - Imutabilidade do Prontuário:** Após o médico salvar e finalizar um Prontuário Eletrônico, o registro e os documentos gerados a partir dele tornam-se imutáveis por questões legais.
* **RN004 - Sigilo Médico:** Detalhes sensíveis do prontuário só podem ser visualizados pelo paciente dono da conta e pelo médico responsável pelo atendimento.
* **RN005 - Efetivação por Pagamento:** O horário na agenda do médico só é bloqueado para outros usuários após a confirmação do pagamento da consulta pelo gateway.
* **RN006 - Inadimplência do Profissional:** Médicos com a assinatura mensal pendente terão seus perfis temporariamente ocultados nas buscas dos pacientes até a regularização.
