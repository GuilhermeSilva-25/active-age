# ⚙️ Requisitos e Regras de Negócio
## Active Age — Plataforma Integral de Telessaúde Geriátrica
### Faculdade de Tecnologia de Diadema (Fatec Luigi Papaiz) — DSM 3º Semestre

Este documento formaliza os requisitos funcionais, não funcionais e as regras de negócio que norteiam a engenharia do **Active Age** no 3º Semestre, consolidando as exigências regulatórias do **Conselho Federal de Medicina (CFM)** — especialmente a **Resolução CFM nº 2.314/2022** (Telemedicina) e a **Resolução CFM nº 2.336/2023** (Publicidade Médica) —, as diretrizes de segurança da **SBIS (Sociedade Brasileira de Informática em Saúde)** e a **Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018)**.

---

## 1. Requisitos Funcionais (RF)
Descrevem as ações, fluxos e serviços providos pelo sistema:

| ID | Descrição | Prioridade |
|---|---|---|
| **RF001** | **Gestão de Identidade:** O sistema deve permitir o cadastro e login de usuários (Paciente/Cuidador, Médico, Admin) com validação de dados via API e emissão de sessão stateless via cookies seguros HttpOnly. | Alta |
| **RF002** | **Credenciamento Médico (Dossiê Ético-Profissional):** O sistema deve permitir que médicos submetam seu dossiê documental completo estruturado em 4 pilares: <br>1. *Habilitação e Identificação:* Carteira CRM (frente/verso legíveis), Diploma de Graduação MEC (frente/verso), RQE (se especialista), RG/CNH/Passaporte e CPF; <br>2. *Regularidade Ética:* Certidão de Regularidade Ético-Profissional do CRM; <br>3. *Telemedicina ICP-Brasil (Res. CFM nº 2.314/2022):* Comprovante de Certificado Digital ICP-Brasil (A1 ou A3) e Declaração de Notificação de Telemedicina no CRM; <br>4. *Dados Cadastrais/Financeiros:* Comprovante de endereço, dados bancários/PIX para split direto de honorários e Cartão CNPJ (se PJ). | Alta |
| **RF003** | **Validação e Auditoria de Perfil (Admin):** O sistema deve oferecer um painel administrativo com fila de credenciamento para auditoria visual de documentos, conferência de checklist e aprovação, reprovação (com justificativa técnica obrigatória) ou suspensão do cadastro do médico. | Alta |
| **RF004** | **Vitrine de Horários (Médico):** O médico devidamente aprovado deve poder gerenciar sua agenda, criando (disponibilizando) e excluindo blocos de horários livres. | Alta |
| **RF005** | **Busca Neutra e Informativa (Paciente):** O paciente/cuidador deve poder buscar médicos homologados e visualizar **apenas** os horários com status 'LIVRE'. O catálogo opera sob neutralidade estrita (Res. CFM nº 2.336/2023), ordenado apenas por critérios objetivos (RQE, localização, data/horário e valor da consulta), sendo proibidos anúncios patrocinados ou leilão financeiro de posições. | Alta |
| **RF006** | **Upload de Exames Prévios:** O paciente/cuidador deve poder enviar laudos antigos (PDF, JPG, PNG) para análise do médico no cofre digital de saúde. | Alta |
| **RF007** | **Teleconsulta Integrada:** O sistema deve prover uma sala de videoconferência segura no horário agendado, com link exclusivo, criptografia de ponta a ponta e logs auditáveis de conexão. | Alta |
| **RF008** | **Prontuário Eletrônico:** O médico deve poder registrar a evolução clínica (queixa, anamnese, diagnóstico, conduta) durante ou após a teleconsulta, com integridade e imutabilidade após finalização. | Alta |
| **RF009** | **Emissão de Documentos Médicos:** O sistema deve permitir ao médico emitir, assinar com Certificado Digital ICP-Brasil (A1 ou A3) e disponibilizar Receitas Médicas, Pedidos de Exames e Atestados (PDF) com validade jurídica nacional e validação no padrão do ITI. | Alta |
| **RF010** | **Download e Histórico Clínico:** O paciente/cuidador deve ter acesso ao histórico clínico vitalício e baixar os documentos médicos gerados. | Alta |
| **RF011** | **Pesquisa Interna de Qualidade e Suporte Técnico:** O sistema deve permitir que o paciente envie feedback privado e confidencial sobre aspectos técnicos da chamada (áudio, vídeo e pontualidade) para fins exclusivos de suporte e auditoria interna, sendo **expressamente proibida a publicação de ranking de estrelas, notas ou avaliações públicas de médicos**, em conformidade com a Resolução CFM nº 2.336/2023. | Média |
| **RF012** | **Processamento com Split Direto de Pagamento (Gateway Regulado):** O sistema deve processar o pagamento da consulta através de gateway regulado pelo Banco Central (ex: Asaas, Pagar.me, Stripe) utilizando **Split Direto na Captura**. O valor integral dos honorários médicos liquida diretamente na subconta/domicílio bancário do profissional ou de sua PJ médica, e a plataforma retém exclusivamente uma taxa fixa de serviço de TI pré-acordada. O dinheiro do médico **nunca transita pela conta bancária corporativa do Active Age**. | Alta |
| **RF013** | **Gestão de Assinaturas SaaS (Licenciamento de Software):** O sistema deve gerenciar a cobrança recorrente (mensalidade fixa) dos médicos pelo uso do consultório virtual após o período de 15 dias de teste grátis, sem incidência de comissões percentuais sobre as consultas. | Média |
| **RF014** | **Gestão e Edição de Perfil de Usuário:** O sistema deve permitir que médicos e pacientes atualizem suas informações cadastrais, façam upload de foto de perfil (avatar), configurem dados de atendimento (médico: RQE, mini-bio, áreas de foco, valor de consulta e duração) e dados de apoio familiar/emergência (paciente: endereço residencial completo e contato do cuidador responsável). | Alta |

---

## 2. Requisitos Não Funcionais (RNF)
Definem os atributos de qualidade, tecnologia e conformidade da plataforma (SBIS / CFM):

| ID | Categoria | Descrição |
|---|---|---|
| **RNF001** | Arquitetura (Front) | O Front-End será uma SPA desenvolvida em **React 19 com TypeScript** e Vite, hospedado na plataforma **Vercel**. |
| **RNF002** | Arquitetura (Back) | O Back-End principal será construído em **Java 21 LTS com Spring Boot 3**, hospedado na plataforma **Render** (Docker multi-stage). |
| **RNF003** | Arquitetura (Banco) | A persistência de dados será feita no **MongoDB Atlas** (NoSQL), ideal para lidar com a variação estrutural de Prontuários e Documentos Médicos, com **criptografia em repouso (AES-256)**. |
| **RNF004** | Microsserviços | Serviços assíncronos (mensageria de recuperação de senha, emissão pesada de PDFs e webhooks de split de pagamento) serão delegados para microsserviços dedicados. |
| **RNF005** | Documentação | A API Restful deve ser documentada via OpenAPI (**Swagger** / `springdoc-openapi`) e as classes/métodos devem possuir **Javadoc/TSDoc**. |
| **RNF006** | Segurança NGS1/NGS2 | Senhas criptografadas com hash irreversível **BCrypt**. Transporte de credenciais em cookies seguros (`HttpOnly; Secure; SameSite=Strict`). Armazenamento privado de arquivos sem URLs estáticas públicas. Controle estrito de rotas com JWT e RBAC (`ROLE_PACIENTE`, `ROLE_MEDICO`, `ROLE_ADMIN`). Trilha de auditoria imutável com timestamp e IP. Assinatura qualificada via **ICP-Brasil (A1/A3)** para documentos médicos (NGS2 da SBIS/CFM). |
| **RNF007** | Acessibilidade (IHC) | A interface Front-End deve seguir as diretrizes **WCAG 2.1** (Nível AA), com contraste mínimo de 4.5:1, alvos táteis de 48px+, fontes legíveis para o público idoso e modais acessíveis (`FeedbackModal.tsx`), abolindo `window.alert()`. |

---

## 3. Regras de Negócio (RN)
As "leis imutáveis" que garantem o funcionamento correto do negócio, da ética médica e da segurança legal:

| ID | Nome da Regra | Descrição da Regra |
|---|---|---|
| **RN001** | **Bloqueio de Double-Booking (Vitrine)** | A consistência da agenda é feita pelo `horario_id`. Ao confirmar a reserva, o status do slot transita instantaneamente para `OCUPADO`, impedindo que outro paciente selecione a mesma vaga. |
| **RN002** | **Antecedência e Rollback de Cancelamento** | O cancelamento pelo usuário só é permitido com 24h de antecedência. Ao cancelar, o sistema faz o "rollback" da agenda, voltando o status do `horario_id` para `LIVRE`. |
| **RN003** | **Imutabilidade de Prontuário Clínico (CFM / SBIS)** | Por questões éticas e legais (CFM), após o médico salvar e finalizar um Prontuário Eletrônico, os registros e documentos atrelados tornam-se imutáveis. Alterações exigem novo adendo com registro de auditoria. |
| **RN004** | **Validação de Exibição e Inadimplência** | Um médico só aparece na busca para pacientes se estiver com status "APROVADO" (Dossiê homologado pelo Admin) E se a sua assinatura SaaS mensal (RF013) estiver em dia após os 15 dias de teste grátis. |
| **RN005** | **Efetivação por Pagamento e Split Automático** | O bloqueio definitivo do horário (`OCUPADO`) só se concretiza mediante a aprovação do pagamento no gateway (RF012). O gateway divide instantaneamente os honorários para a subconta do médico e a taxa fixa para a plataforma. Falhas no pagamento estornam o slot para `LIVRE`. |
| **RN006** | **Sigilo e Consentimento Específico (LGPD)** | O uso da plataforma exige o aceite explícito da LGPD no cadastro. O acesso a prontuários e exames é estritamente limitado ao paciente e ao médico vinculado ao atendimento. |
| **RN007** | **Segurança, Confidencialidade e Trilha de Auditoria dos Documentos Médicos** | Todos os documentos do Dossiê do Médico (CRM, Diploma, Certidões, Comprovante ICP-Brasil e dados bancários) devem ser gravados em repositório privado, com bloqueio total de indexação e acesso direto por URL estática. O acesso a esses arquivos é restrito via RBAC a auditores com permissão `ROLE_ADMIN` e ao próprio médico titular. Qualquer visualização ou download gera obrigatoriamente um registro na coleção de trilha de auditoria (`audit_logs`) com data/hora, endereço IP e ID do usuário auditor. |
| **RN008** | **Habilitação Condicional à Aprovação Formal do Dossiê Completo** | O médico recém-cadastrado possui status provisório `PENDING_DOCS` ou `UNDER_REVIEW`. É terminantemente proibido o médico abrir agenda de atendimento, disponibilizar vitrine de horários, atender teleconsultas ou prescrever receitas antes da conferência de conformidade e aprovação formal de todos os documentos obrigatórios pelo Administrador/Auditor da plataforma, em estrito cumprimento à Resolução CFM nº 2.314/2022. |
| **RN009** | **Vedação à Dicotomia e Cobrança de Comissões Médicas** | É terminantemente proibida a cobrança de percentuais variáveis sobre o valor das consultas médicas realizadas (prática de dicotomia vedada pelo Código de Ética Médica e pelo CFM). O Active Age remunera-se unicamente via taxa de licenciamento mensal fixa (SaaS) ou taxa administrativa fixa de serviço de TI por agendamento para cobertura de custos tecnológicos, mantendo segregação patrimonial total dos honorários médicos. |
| **RN010** | **Neutralidade da Busca e Proibição de Publicidade Mercantilizada (Res. CFM nº 2.336/2023)** | O catálogo de busca de profissionais deve ser neutro e puramente informativo. É vedada a venda de posicionamento privilegiado ("destaque patrocinado"), bem como a exibição pública de avaliações por estrelas, rankings ou comentários que mercantilizem o ato médico ou exponham o paciente. A ordenação é pautada unicamente por critérios objetivos (RQE, localidade, data/horário e valor). |
| **RN011** | **Direção Técnica Médica e Registro de Empresa de Telemedicina no CRM** | Para operar comercialmente em conformidade com as normas do CFM, a pessoa jurídica proprietária da plataforma Active Age deve manter inscrição ativa no Conselho Regional de Medicina (CREMESP), recolher as taxas devidas e contar com um médico formalmente nomeado como Diretor Técnico Responsável. |
