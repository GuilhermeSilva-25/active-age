# ⚙️ Requisitos e Regras de Negócio

Este documento formaliza as regras que norteiam a engenharia do **Active Age** no 3º Semestre. Ele mescla a visão do planejamento macro com o escopo completo definido no 1º Semestre e a arquitetura real de "Vitrine de Agendamentos" consolidada e testada no 2º Semestre.

## 1. Requisitos Funcionais (RF)
Descrevem as ações e serviços que o sistema deve realizar para atender aos usuários.

| ID | Descrição | Prioridade |
|---|---|---|
| **RF001** | **Gestão de Identidade:** O sistema deve permitir o cadastro e login de usuários (Paciente/Cuidador, Médico, Admin) com validação de dados via API. | Alta |
| **RF002** | **Credenciamento Médico:** O sistema deve permitir que médicos submetam comprovantes de habilitação (CRM/RQE) via upload para auditoria. | Alta |
| **RF003** | **Validação de Perfil:** O sistema deve oferecer um painel administrativo para aprovação, reprovação ou suspensão do cadastro de médicos. | Alta |
| **RF004** | **Vitrine de Horários (Médico):** O Médico deve poder gerenciar sua agenda, criando (disponibilizando) e excluindo blocos de horários livres. | Alta |
| **RF005** | **Busca Inteligente (Paciente):** O Paciente/Cuidador deve poder buscar médicos aprovados e visualizar **apenas** os horários com status 'LIVRE'. | Alta |
| **RF006** | **Upload de Exames Prévios:** O paciente/cuidador deve poder enviar laudos antigos (PDF, JPG, PNG) para análise do médico. | Alta |
| **RF007** | **Teleconsulta Integrada:** O sistema deve prover uma sala de videoconferência segura no horário agendado, com link único. | Alta |
| **RF008** | **Prontuário Eletrônico:** O médico deve poder registrar a evolução clínica (queixa, anamnese, diagnóstico, conduta) durante ou após a teleconsulta. | Alta |
| **RF009** | **Emissão de Documentos Médicos:** O sistema deve permitir ao médico emitir, assinar e disponibilizar Receitas Médicas, Pedidos de Exames e Atestados (PDF). | Alta |
| **RF010** | **Download e Histórico:** O paciente/cuidador deve ter acesso ao histórico clínico e baixar os documentos médicos gerados. | Alta |
| **RF011** | **Avaliação de Consulta:** O sistema deve permitir que o paciente avalie o atendimento do médico (feedback). | Média |
| **RF012** | **Pagamento de Consultas:** O sistema deve processar o pagamento da consulta integrado ao momento da confirmação do agendamento. | Alta |
| **RF013** | **Gestão de Assinaturas (SaaS):** O sistema deve gerenciar a cobrança recorrente (mensalidade) dos médicos pelo uso da plataforma. | Média |

## 2. Requisitos Não Funcionais (RNF)
Definem os atributos de qualidade, tecnologia e segurança da plataforma (Atualizados para a Stack do 3º Semestre).

| ID | Categoria | Descrição |
|---|---|---|
| **RNF001** | Arquitetura (Front) | O Front-End será uma SPA desenvolvida em **React com TypeScript** e Vite, hospedado na plataforma **Vercel**. |
| **RNF002** | Arquitetura (Back) | O Back-End principal será construído em **Java 21 com Spring Boot**, hospedado na plataforma **Railway**. |
| **RNF003** | Arquitetura (Banco) | A persistência de dados será feita no **MongoDB Atlas** (NoSQL), ideal para lidar com a variação estrutural de Prontuários e Documentos Médicos. |
| **RNF004** | Microsserviços | Integrações externas (APIs de Pagamento, Vídeo e/ou PDF) serão delegadas para **Microsserviços**, não bloqueando o *thread pool* da API principal. |
| **RNF005** | Documentação | A API Restful deve ser documentada via OpenAPI (**Swagger** / `springdoc-openapi`) e as classes/métodos devem possuir **Javadoc**. |
| **RNF006** | Segurança | Senhas e dados sensíveis devem usar criptografia irreversível (BCrypt). A comunicação deve usar HTTPS/TLS. Controle de rotas com JWT (StateLess) e RBAC. |
| **RNF007** | Acessibilidade | A interface Front-End deve seguir as diretrizes **WCAG 2.1** (Nível AA), com alto contraste e fontes ajustáveis para o idoso. |

## 3. Regras de Negócio (RN)
As "leis imutáveis" que garantem o funcionamento correto do negócio e da aplicação médica.

| ID | Descrição da Regra |
|---|---|
| **RN001** | **Bloqueio de Double-Booking (Vitrine):** A consistência da agenda é feita pelo `horario_id`. Ao confirmar a reserva, o status do slot transita instantaneamente para `OCUPADO`, impedindo que outro paciente selecione a mesma vaga. |
| **RN002** | **Antecedência e Rollback de Cancelamento:** O cancelamento pelo usuário só é permitido com 24h de antecedência. Ao cancelar, o sistema faz o "rollback" da agenda, voltando o status do `horario_id` para `LIVRE`. |
| **RN003** | **Imutabilidade de Prontuário:** Por questões éticas e legais (CFM), após o médico salvar e finalizar um Prontuário Eletrônico, os registros e documentos atrelados tornam-se imutáveis. Alterações exigem novo adendo. |
| **RN004** | **Validação de Exibição e Inadimplência:** Um médico só aparece na busca para pacientes se estiver com status "APROVADO" (CRM validado pelo Admin) E se a sua assinatura SaaS mensal (RF013) estiver em dia. |
| **RN005** | **Efetivação por Pagamento:** O bloqueio definitivo do horário (`OCUPADO`) só se concretiza mediante a aprovação do pagamento no gateway (RF012). Falhas no pagamento estornam o slot para `LIVRE`. |
| **RN006** | **Sigilo e Termo de Consentimento:** O uso da plataforma exige o aceite explícito da LGPD no cadastro. O acesso a prontuários e exames (RNF006) é estritamente limitado ao paciente e ao médico vinculado ao atendimento. |
