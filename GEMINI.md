# 🩺 ACTIVE AGE — REGRAS DO PROJETO & CONTEXTO OPERACIONAL (ANTIGRAVITY)

> **Aviso para o Agente Antigravity:** Este arquivo é carregado automaticamente na inicialização de qualquer sessão neste repositório. Ele constitui a bússola de governança, arquitetura e estado atual do projeto Active Age. Você DEVE seguir estritamente as diretrizes aqui definidas.

---

## 1. Visão Geral & Papéis
- **Projeto:** Active Age — Plataforma Integral de Telessaúde Geriátrica.
- **Contexto Acadêmico:** Graduação em Desenvolvimento de Software Multiplataforma (DSM) — Fatec Diadema (São Paulo).
- **Semestre Atual de Foco:** **Transição para o 4º Semestre** (3º Semestre 100% Concluído e Homologado em Produção com Releases v0.1.0 a v0.4.0 e Specs SPEC-01 a SPEC-14).
- **Product Owner & Tech Lead:** Guilherme Silva (Usuário).
- **Seu Papel:** Antigravity Pair Programmer Sênior (Especialista em Spring Boot 3, React 19, TypeScript, Arquitetura de Software e SDD).

---

## 2. Metodologia Inegociável: Spec-Driven Development (SDD)
1. **Regra de Ouro (Zero Código Sem Spec):** NUNCA escreva, edite ou refatore código de funcionalidade sem antes redigir uma Especificação Técnica detalhada (Spec) e obter a **aprovação explícita** do Guilherme.
2. **Micro Tarefas Testáveis:** O desenvolvimento é estritamente dividido em micro tarefas que geram valor verificável a cada passo.
3. **Padrão de UI & Acessibilidade (IHC / WCAG):** É estritamente proibido o uso de `window.alert()`, `confirm()` ou `prompt()`. Toda interação e feedback com o usuário DEVE utilizar o componente acessível [`FeedbackModal.tsx`](./3-Semestre/frontend-react/src/components/common/FeedbackModal.tsx), projetado com botões táteis ampliados para o público idoso.
4. **Padrão de Commits:** Utilize *Conventional Commits* estritamente em **português**:
   - `feat(...)`: nova funcionalidade
   - `fix(...)`: correção de bug
   - `docs(...)`: documentação
   - `test(...)`: testes unitários/integrados/BDD
   - `refactor(...)`: refatoração sem alteração de comportamento
   - `ci(...)` / `chore(...)`: infraestrutura e dependências
5. **Persistência de Conhecimento:** Toda documentação, relatório, spec ou plano gerado DEVE ser salvo na pasta oficial `3-Semestre/docs_ia/` e commitado no Git.
6. **Compliance Ético-Médico Inegociável (CFM, SBIS & LGPD):** Proibição absoluta de comissões percentuais sobre consultas (vedação à dicotomia); arquitetura de Split Direto em gateway regulado; busca neutra e informativa sem ranking de estrelas ou destaque pago (Res. CFM nº 2.336/2023); exigência estrita de Certificado Digital ICP-Brasil (A1/A3) e prontuário certificado com Níveis de Garantia de Segurança NGS1/NGS2.

---

## 3. Fontes Únicas da Verdade (Docs Oficiais em `3-Semestre/docs_ia/`)
Antes de propor soluções ou executar tarefas, consulte os seguintes documentos:
1. `3-Semestre/docs_ia/CONTEXTO_OPERACIONAL_E_GOVERNANCA_SDD.md`: Arquitetura completa, stack técnica, regras de segurança (BCrypt, HttpOnly, Rate Limit) e governança.
2. `3-Semestre/docs_ia/PLANO_DE_RELEASE_ACTIVE_AGE.md`: Roadmap de releases (v0.1.0 até v0.5.0), detalhamento de sprints, escopo e critérios de aceite.
3. `3-Semestre/docs_ia/ROTEIRO_DE_TESTES_BDD_ACTIVE_AGE.md`: Roteiro de testes executivo no modelo oficial da Fatec (Prof. Edson Saraiva) cobrindo caminhos felizes e tristes.
4. `3-Semestre/docs_ia/RELATORIO_ANALISE_INTEGRAL_PROJETO_INTEGRADOR.md`: Relatório completo alinhado ao PPC oficial da Fatec Diadema (2024/1).
5. `3-Semestre/docs_ia/GUIA_DESENVOLVIMENTO_MULTIMAQUINAS.md`: Guia de configuração de ambiente e sincronização para trabalhar em múltiplos computadores.
6. `3-Semestre/docs_ia/BACKLOG_FUNCIONALIDADES_FUTURAS.md`: Backlog arquitetural e de longo prazo, incluindo o desenho do microsserviço assíncrono de mensageria para recuperação de senha e alertas.
7. `3-Semestre/docs_ia/MATRIZ_CONFORMIDADE_LEGAL_E_REGULATORIA_CFM_LGPD.md`: Matriz de compliance e governança regulatória (CFM Res. 2.314/2022, CFM Res. 2.336/2023, SBIS NGS1/NGS2, Split Direto sem Dicotomia e LGPD).

---

## 4. Stack Tecnológica Oficial (3º Semestre)
- **Backend:** Java 21 LTS + Spring Boot 3.4.x + Spring Data MongoDB + Spring Security + Jakarta Validation + Bucket4j + GlobalExceptionHandler + Lombok.
- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS v4 + React Router Dom v7 + Lucide React + Zod.
- **Banco de Dados:** MongoDB Atlas (Replica Set na nuvem, multi-tenant com soft delete).
- **Segurança:** Senhas em BCrypt, autenticação via JWT armazenado em cookies `HttpOnly; Secure; SameSite=Strict`, proteção contra força bruta com Rate Limiting.

---

## 5. Ambientes & Infraestrutura de Produção
- **Backend Core (Render):** `https://active-age-backend-mgyw.onrender.com`
  - *Swagger / Documentação da API:* `https://active-age-backend-mgyw.onrender.com/swagger-ui/index.html`
  - *Configuração no Render:* Root Directory = `3-Semestre/backend-core`, Dockerfile Path = `Dockerfile` (sem prefixo).
- **Frontend SPA (Vercel):** `vercel.json` configurado para redirecionar `/api/(.*)` diretamente para o Render, garantindo mesmo domínio lógico e transporte seguro de cookies HttpOnly.
- **Ambiente Local (Vite):** `vite.config.ts` configurado com proxy `/api` apontando para `http://localhost:8080`.

---

## 6. Estado Atual & Roadmap Imediato
- **Release v0.1.0 (Sprint 1) — [CONCLUÍDO / EM PRODUÇÃO]:**
  - Entidade `User` com campos médicos (`crm`, `ufCrm`).
  - DTO de validação `DoctorRegisterRequest` com Jakarta.
  - Criptografia BCrypt no `AuthService`.
  - Endpoints de autenticação: `POST /api/auth/register-doctor`, `GET /api/auth/me`, `POST /api/auth/logout`, `GET /api/auth/check-email`.
  - Frontend integrado com formulário real, feedback de erro/sucesso e Navbar reativa.
  - Sistema de modais acessíveis com `FeedbackModal.tsx` em substituição ao `window.alert()`.
  - Checagem assíncrona de e-mail prévio na Etapa 1 e alternância de visibilidade de senhas (olhinho).
  - Tratador Global de Exceções (`GlobalExceptionHandler`) mapeando erros de credenciais para HTTP 400 Bad Request.
  - Linha conectora de etapas no `ProgressBar` e ícone `AlertCircle` em todas as mensagens de erro (IHC/WCAG).
  - Deploy no Render e Vercel funcionando em produção.
- **Release v0.2.0 (Sprint 2) — [CONCLUÍDA / EM PRODUÇÃO]:**
  - Micro Tarefa 2.1 [CONCLUÍDA]: Blindagem RBAC com `ProtectedRoute.tsx`, `AdminLayout.tsx`, `AdminDashboard.tsx` e Seeding de Administrador (`admin@activeage.com` / `AdminPassword2026!` via SPEC-02).
  - Micro Tarefa 2.2 & 2.2B [CONCLUÍDAS]: Módulo de Credenciamento Médico Integral (Dossiê em 4 Pilares: Habilitação, Regularidade Ética, Telemedicina ICP-Brasil Res. CFM nº 2.314/2022 e Dados Financeiros; Upload seguro privado, suporte a frente/verso, máscaras bancárias reativas, catálogo de bancos com código COMPE e Fila de Auditoria do Admin com aprovação/rejeição com justificativa obrigatória).
  - Micro Tarefa 2.3 & UC05 [CONCLUÍDAS]: Gestão de Usuários & Trilha de Auditoria Global (`audit_logs`) com moderação de status, trava de auto-bloqueio, bloqueio perimetral de login para contas inativas, revogação de sessão ativa em tempo real e testes unitários no `AuthServiceTest`.
  - Micro Tarefa 2.4 & 2.4B [CONCLUÍDAS]: Dashboards segregados de Paciente (`DashboardPaciente.tsx` com acessibilidade WCAG 2.1 AA) e Médico (`DashboardMedico.tsx` com banner regulatório Res. CFM nº 2.314/2022, métricas de consultório e degustação SaaS de 15 dias), roteamento inteligente pós-login, Navbar reativa e padronização universal de spinners táteis de carregamento.
  - Semeador de Médicos Pioneiros (SPEC-05C) [CONCLUÍDA]: 5 médicos geriatras pioneiros homologados semeados no `DataInitializer.java` em homenagem aos grandes nomes da tecnologia (Ada Lovelace, Alan Turing, Grace Hopper, Margaret Hamilton e Tim Berners-Lee com senha de testes `ActiveAge2026!`).
- **Release v0.3.0 (Sprint 3) — [CONCLUÍDA / EM PRODUÇÃO]:**
  - Módulo de Gestão de Perfil de Usuário com fotos, biografia clínica e dados do cuidador familiar (SPEC-06 / UC18).
  - Vitrine e Busca Inteligente de Médicos Geriatras com filtros clínicos e ordenação neutra (Res. CFM nº 2.336/2023) (SPEC-07 / UC08).
  - Submissão e Cofre Digital de Exames Prévios pelo Paciente com MongoDB GridFS (SPEC-08 / UC11).
  - Gestão da Agenda Médica com turnos em lote e slots avulsos (SPEC-09 / UC10).
  - Agendamento Concorrente de Teleconsulta com reserva atômica sem double-booking, painel de "Minhas Consultas" e política ética de cancelamento com mais de 24 horas e reciclagem de horários (SPEC-10 / UC09).
  - Semeador de Médico de Teste (`medico@teste.com` / `123456`) e Paciente de Teste Dona Maria (`paciente@teste.com` / `123456`) com foto de perfil humanizada (`avatarUrl`), grade ampla matutina a noturna (08h às 22h), consultas ativas confirmadas para hoje (sem expiração dinâmica) e amanhã às 14h, fuso horário oficial de Brasília (`America/Sao_Paulo`), 2 exames prévios no GridFS e sincronização horária contínua via Spring `@Scheduled` (SPEC-11B, SPEC-11E, SPEC-11F).
  - Rastreabilidade de Teleconsultas na Trilha de Auditoria Imutável (`audit_logs`) e Painel de Métricas Operacionais com sigilo LGPD no Dashboard do Administrador (SPEC-11C / UC04, UC05, UC09).
  - Padronização Universal das Fotos dos 17 Médicos Pioneiros com Retratos Históricos Reais de domínio público / Wikimedia Commons e proteção anti-hotlink no frontend (SPEC-11D).
  - Banco Dinâmico de Dicas de Longevidade Ativa no Dashboard do Paciente com 12 intervenções baseadas em literatura médica (SBGG, OMS, Harvard, The Lancet, EWGSOP2) e alternância interativa (SPEC-11G).
  - Reorganização de UX dos Dashboards com Priorização Visual de Consultas Agendadas: no paciente, consulta no topo logo após as boas-vindas com botão direto da sala; no médico, fila do dia promovida antes das ferramentas quando houver consultas hoje (SPEC-11H).
  - Remoção de Sintomas Prévios no Agendamento e Centralização da Anamnese na Teleconsulta: fluxo simplificado para o idoso, eliminação de textarea de queixas prévias e exclusão de sintomas pré-preenchidos no semeador (SPEC-11I).
  - Correção da Janela Temporal da Agenda Médica e Dinamização Universal de Contadores: início em 00:00:00 da data local de hoje em Minha Agenda, endpoint `/api/doctor/stats`, dinamização dos contadores do Dashboard Médico e badges reativas nas abas de filtro (SPEC-11J).
- **Release v0.4.0 (Conclusão do 3º Semestre) — [CONCLUÍDA / EM PRODUÇÃO]:**
  - Cockpit Integrado de Teleconsulta com experiência responsiva computador/mobile (UC12-Demo).
  - Prontuário Ético Eletrônico Geriátrico Imutável (Anamnese, AGA, CID-11, Conduta, Hash SHA-256 e trava irrevogável de integridade) (UC14 / RN003).
  - Visualização Médica dos Exames e Laudos do Idoso dentro da chamada virtual (UC13).
  - Módulo de Emissão de Receitas Médicas Digitais, Pedidos de Exames e Atestados com código seguro ICP-Brasil `AA-2026-XXXXXX` (UC15).
  - Painel do Paciente para Consulta e Impressão Timbrada de Documentos Oficiais (UC16).
  - Validador Público de Prescrições e Atestados perante o CRM e ICP-Brasil (`/validar-documento`).
  - Reformulação da Sala de Teleconsulta (SPEC-12B): Card Único de Prontuário preparado para IA, sincronização em tempo real de receitas emitidas para o idoso, fluxo de saída seguro sem encerramento acidental, template de prescrição limpo sem mock e receituário timbrado em Preto e Branco puro para impressão/PDF Gov.br.
  - Simplificação do Prontuário Clínico & Especificação de Assinatura Digital e IA no Backlog (SPEC-12C): Card Único de Prontuário super limpo e focado em TeleconsultaRoom.tsx (remoção do card de IA e de parâmetros da AGA da tela), detalhamento arquitetural completo de Assinatura Gov.br/ICP-Brasil e Copiloto de IA no BACKLOG_FUNCIONALIDADES_FUTURAS.md.
  - Baixa Automática de Consultas Finalizadas & Acesso aos Prontuários pelo Médico (SPEC-13): Bloqueio definitivo de reingresso em chamadas finalizadas, tela de atendimento concluído com download de receitas, prevenção de recriação de consultas no semeador, visualização das consultas realizadas na fila do médico e modal MedicalRecordViewModal para conferência do prontuário com hash SHA-256.
  - Central de Prontuários & Prescrições Digitais no Dashboard do Médico (SPEC-14): Ativação do Card 3 das ferramentas médicas, busca reativa, filtros de status, acesso ao prontuário clínico com hash SHA-256 e impressão de receitas/atestados em modelo P&B.
- **4º Semestre — [EM DESENVOLVIMENTO ATIVO 🚀]:**
  - Pipeline de CI/CD Industrial no GitHub Actions (SPEC-15) [CONCLUÍDA / LIVE ✅]: Esteira com 9 Pilares, matriz paralela (Backend Java 21 / Frontend React 19), 37 testes automatizados JUnit 5/Mockito, cobertura de código Jacoco (HTML/XML), linter oxlint, scanner DevSecOps com Trivy CLI, build da imagem Docker multi-stage e GitHub Step Summary executivo em Markdown.
  - Blindagem de Testes Automatizados & Expansão JaCoCo (SPEC-15B) [CONCLUÍDA / LIVE ✅]: 180 testes automatizados (0 falhas/erros), cobertura geral elevada de 48% para 84% de instruções e 56% de branches; 14 controladores RESTful 100% blindados com MockMvc (96% instruções), serviços em 80%, exceptions e utils em 100%, 0 classes sem teste (45/45).
  - Ajustes de Usabilidade: Foto Humanizada, Modais Responsivos e Limpeza no Admin (SPEC-15C) [CONCLUÍDA / LIVE ✅]: Retrato acolhedor da Dona Maria (Wikimedia Commons) com resiliência no semeador, hook `useBodyScrollLock` e rolagem interna em todos os modais da aplicação, eliminação de cards redundantes no AdminDashboard e expansão para 181 testes automatizados (0 falhas).
  - Marcos Concluídos do 4º Semestre:
    - SPEC-15: Pipeline de CI/CD Industrial no GitHub Actions [LIVE ✅]
    - SPEC-15B: Blindagem de Testes Automatizados & Expansão JaCoCo 84% [LIVE ✅]
    - SPEC-15C: Usabilidade, Fotos Humanizadas e Rolagem Interna de Modais [LIVE ✅]
    - SPEC-16: Microsserviço de Teleconsulta WebRTC Nativo P2P com Signaling [LIVE ✅]
    - SPEC-17: Microsserviço de Pagamento com Split Direto BACEN e Gestão de Assinaturas SaaS do Médico via Mercado Pago [CONCLUÍDO ✅]: Novo serviço ms-pagamento-faturamento (Java 21 LTS + Spring Boot 3 + JPA/H2 + Resilience4j + Caffeine + Mercado Pago API Oficial v1/payments), 34 testes automatizados unitários/MockMvc (0 falhas), Split Direto 100% médico sem dicotomia (Res. CFM nº 2.314/2022), faturamento SaaS de consultório virtual (R$ 149,90/mês), Circuit Breaker com fallback de contingência, callbacks atômicos no backend-core (184 testes 100% aprovados), checkout Pix no paciente com QR Code dinâmico e modal AssinaturaSaaSModal.tsx no médico. Total de 218 testes backend automatizados!
  - Próximos Marcos do 4º Semestre: SPEC-18 (Orquestração com Docker Compose e Deploy/Push GHCR).
- **5º Semestre — [FUTURO]:**
  - Aplicativo Mobile Multiplataforma (React Native) e Ingestão de Wearables de Saúde.

---

## 7. Instruções de Inicialização para o Antigravity em Novo Computador / Sessão
Ao iniciar qualquer interação neste repositório:
1. Reconheça o Guilherme como PO e confirme que o contexto de governança e arquitetura foi carregado a partir deste arquivo.
2. Verifique o arquivo `3-Semestre/docs_ia/PLANO_DE_RELEASE_ACTIVE_AGE.md` para identificar exatamente onde paramos.
3. Lembre-se que as credenciais universais para testes imediatos são:
   - Administrador: `admin@activeage.com` / `AdminPassword2026!`
   - Médico Teste: `medico@teste.com` / `123456` (sempre possui consulta confirmada para hoje e amanhã)
   - Paciente Teste: `paciente@teste.com` / `123456` (possui foto de perfil, exames prévios no cofre e consulta agendada para hoje e amanhã)
4. Não inicie implementação de código antes de:
   - Apresentar a Spec Técnica detalhada da próxima micro tarefa/ajuste;
   - Obter a aprovação formal e explícita do Guilherme.
