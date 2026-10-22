# ⚙️ Requisitos e Regras de Negócio
## Active Age — Plataforma Integral de Telessaúde Geriátrica
### Faculdade de Tecnologia de Diadema (Fatec Luigi Papaiz) — DSM 3º Semestre

Este documento formaliza os requisitos funcionais, não funcionais e as regras de negócio que norteiam a engenharia do **Active Age** no 3º Semestre, consolidando as exigências regulatórias do **Conselho Federal de Medicina (CFM)**, em especial a **Resolução CFM nº 2.314/2022**, e da **Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018)**.

---

## 1. Requisitos Funcionais (RF)
Descrevem as ações, fluxos e serviços providos pelo sistema:

| ID | Descrição | Prioridade |
|---|---|---|
| **RF001** | **Gestão de Identidade:** O sistema deve permitir o cadastro e login de usuários (Paciente/Cuidador, Médico, Admin) com validação de dados via API e emissão de sessão stateless via cookies seguros HttpOnly. | Alta |
| **RF002** | **Credenciamento Médico (Dossiê Ético-Profissional):** O sistema deve permitir que médicos submetam seu dossiê documental completo estruturado em 4 pilares: <br>1. *Habilitação e Identificação:* Carteira CRM (frente/verso legíveis), Diploma de Graduação MEC (frente/verso), RQE (se especialista), RG/CNH/Passaporte e CPF; <br>2. *Regularidade Ética:* Certidão de Regularidade Ético-Profissional do CRM; <br>3. *Telemedicina ICP-Brasil (Res. CFM nº 2.314/2022):* Comprovante de Certificado Digital ICP-Brasil (A1 ou A3) e Declaração de Notificação de Telemedicina no CRM; <br>4. *Dados Cadastrais/Financeiros:* Comprovante de endereço, dados bancários/PIX para repasse de honorários e Cartão CNPJ (se PJ). | Alta |
| **RF003** | **Validação e Auditoria de Perfil (Admin):** O sistema deve oferecer um painel administrativo com fila de credenciamento para auditoria visual de documentos, conferência de checklist e aprovação, reprovação (com justificativa técnica obrigatória) ou suspensão do cadastro do médico. | Alta |
| **RF004** | **Vitrine de Horários (Médico):** O médico devidamente aprovado deve poder gerenciar sua agenda, criando (disponibilizando) e excluindo blocos de horários livres. | Alta |
| **RF005** | **Busca Inteligente (Paciente):** O paciente/cuidador deve poder buscar médicos homologados e visualizar **apenas** os horários com status 'LIVRE'. | Alta |
| **RF006** | **Upload de Exames Prévios:** O paciente/cuidador deve poder enviar laudos antigos (PDF, JPG, PNG) para análise do médico no cofre digital de saúde. | Alta |
| **RF007** | **Teleconsulta Integrada:** O sistema deve prover uma sala de videoconferência segura no horário agendado, com link exclusivo e criptografia de ponta a ponta. | Alta |
| **RF008** | **Prontuário Eletrônico:** O médico deve poder registrar a evolução clínica (queixa, anamnese, diagnóstico, conduta) durante ou após a teleconsulta. | Alta |
| **RF009** | **Emissão de Documentos Médicos:** O sistema deve permitir ao médico emitir, assinar com Certificado Digital ICP-Brasil e disponibilizar Receitas Médicas, Pedidos de Exames e Atestados (PDF) com validade jurídica nacional. | Alta |
| **RF010** | **Download e Histórico Clínico:** O paciente/cuidador deve ter acesso ao histórico clínico vitalício e baixar os documentos médicos gerados. | Alta |
| **RF011** | **Avaliação de Consulta:** O sistema deve permitir que o paciente avalie o atendimento do médico (feedback e pontuação). | Média |
| **RF012** | **Pagamento de Consultas:** O sistema deve processar o pagamento da consulta integrado ao momento da confirmação do agendamento, protegendo contra inadimplência. | Alta |
| **RF013** | **Gestão de Assinaturas (SaaS):** O sistema deve gerenciar a cobrança recorrente (mensalidade) dos médicos após o período promocional de 15 dias de teste grátis. | Média |

---

## 2. Requisitos Não Funcionais (RNF)
Definem os atributos de qualidade, tecnologia e conformidade da plataforma:

| ID | Categoria | Descrição |
|---|---|---|
| **RNF001** | Arquitetura (Front) | O Front-End será uma SPA desenvolvida em **React 19 com TypeScript** e Vite, hospedado na plataforma **Vercel**. |
| **RNF002** | Arquitetura (Back) | O Back-End principal será construído em **Java 21 LTS com Spring Boot 3**, hospedado na plataforma **Render** (Docker multi-stage). |
| **RNF003** | Arquitetura (Banco) | A persistência de dados será feita no **MongoDB Atlas** (NoSQL), ideal para lidar com a variação estrutural de Prontuários e Documentos Médicos. |
| **RNF004** | Microsserviços | Serviços assíncronos (mensageria de recuperação de senha, emissão pesada de PDFs e webhooks de pagamento) serão delegados para microsserviços dedicados. |
| **RNF005** | Documentação | A API Restful deve ser documentada via OpenAPI (**Swagger** / `springdoc-openapi`) e as classes/métodos devem possuir **Javadoc/TSDoc**. |
| **RNF006** | Segurança | Senhas criptografadas com hash irreversível **BCrypt**. Transporte de credenciais em cookies seguros (`HttpOnly; Secure; SameSite=Strict`). Armazenamento privado de arquivos sem URLs estáticas públicas. Controle estrito de rotas com JWT e RBAC (`ROLE_PACIENTE`, `ROLE_MEDICO`, `ROLE_ADMIN`). |
| **RNF007** | Acessibilidade (IHC) | A interface Front-End deve seguir as diretrizes **WCAG 2.1** (Nível AA), com contraste mínimo de 4.5:1, alvos táteis de 48px+, fontes legíveis para o público idoso e modais acessíveis (`FeedbackModal.tsx`), abolindo `window.alert()`. |

---

## 3. Regras de Negócio (RN)
As "leis imutáveis" que garantem o funcionamento correto do negócio, da ética médica e da segurança legal:

| ID | Nome da Regra | Descrição da Regra |
|---|---|---|
| **RN001** | **Bloqueio de Double-Booking (Vitrine)** | A consistência da agenda é feita pelo `horario_id`. Ao confirmar a reserva, o status do slot transita instantaneamente para `OCUPADO`, impedindo que outro paciente selecione a mesma vaga. |
| **RN002** | **Antecedência e Rollback de Cancelamento** | O cancelamento pelo usuário só é permitido com 24h de antecedência. Ao cancelar, o sistema faz o "rollback" da agenda, voltando o status do `horario_id` para `LIVRE`. |
| **RN003** | **Imutabilidade de Prontuário Clínico** | Por questões éticas e legais (CFM), após o médico salvar e finalizar um Prontuário Eletrônico, os registros e documentos atrelados tornam-se imutáveis. Alterações exigem novo adendo com timestamp. |
| **RN004** | **Validação de Exibição e Inadimplência** | Um médico só aparece na busca para pacientes se estiver com status "APROVADO" (Dossiê homologado pelo Admin) E se a sua assinatura SaaS mensal (RF013) estiver em dia após os 15 dias de teste grátis. |
| **RN005** | **Efetivação por Pagamento** | O bloqueio definitivo do horário (`OCUPADO`) só se concretiza mediante a aprovação do pagamento no gateway (RF012). Falhas no pagamento estornam o slot para `LIVRE`. |
| **RN006** | **Sigilo e Termo de Consentimento** | O uso da plataforma exige o aceite explícito da LGPD no cadastro. O acesso a prontuários e exames é estritamente limitado ao paciente e ao médico vinculado ao atendimento. |
| **RN007** | **Segurança, Confidencialidade e Trilha de Auditoria dos Documentos Médicos** | Todos os documentos do Dossiê do Médico (CRM, Diploma, Certidões, Comprovante ICP-Brasil e dados bancários) devem ser gravados em repositório privado, com bloqueio total de indexação e acesso direto por URL estática. O acesso a esses arquivos é restrito via RBAC a auditores com permissão `ROLE_ADMIN` e ao próprio médico titular. Qualquer visualização ou download gera obrigatoriamente um registro na coleção de trilha de auditoria (`audit_logs`) com data/hora, endereço IP e ID do usuário auditor. |
| **RN008** | **Habilitação Condicional à Aprovação Formal do Dossiê Completo** | O médico recém-cadastrado possui status provisório `PENDING_DOCS` ou `UNDER_REVIEW`. É terminantemente proibido o médico abrir agenda de atendimento, disponibilizar vitrine de horários, atender teleconsultas ou prescrever receitas antes da conferência de conformidade e aprovação formal de todos os documentos obrigatórios pelo Administrador/Auditor da plataforma, em estrito cumprimento à Resolução CFM nº 2.314/2022. |
