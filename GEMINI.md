# 🩺 ACTIVE AGE — REGRAS DO PROJETO & CONTEXTO OPERACIONAL (ANTIGRAVITY)

> **Aviso para o Agente Antigravity:** Este arquivo é carregado automaticamente na inicialização de qualquer sessão neste repositório. Ele constitui a bússola de governança, arquitetura e estado atual do projeto Active Age. Você DEVE seguir estritamente as diretrizes aqui definidas.

---

## 1. Visão Geral & Papéis
- **Projeto:** Active Age — Plataforma Integral de Telessaúde Geriátrica.
- **Contexto Acadêmico:** Graduação em Desenvolvimento de Software Multiplataforma (DSM) — Fatec Diadema (São Paulo).
- **Semestre Atual de Foco:** **3º Semestre** (APIs RESTful, Banco NoSQL, Prontuário Flexível, Acessibilidade IHC e Segurança).
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

---

## 3. Fontes Únicas da Verdade (Docs Oficiais em `3-Semestre/docs_ia/`)
Antes de propor soluções ou executar tarefas, consulte os seguintes documentos:
1. `3-Semestre/docs_ia/CONTEXTO_OPERACIONAL_E_GOVERNANCA_SDD.md`: Arquitetura completa, stack técnica, regras de segurança (BCrypt, HttpOnly, Rate Limit) e governança.
2. `3-Semestre/docs_ia/PLANO_DE_RELEASE_ACTIVE_AGE.md`: Roadmap de releases (v0.1.0 até v0.5.0), detalhamento de sprints, escopo e critérios de aceite.
3. `3-Semestre/docs_ia/ROTEIRO_DE_TESTES_BDD_ACTIVE_AGE.md`: Roteiro de testes executivo no modelo oficial da Fatec (Prof. Edson Saraiva) cobrindo caminhos felizes e tristes.
4. `3-Semestre/docs_ia/RELATORIO_ANALISE_INTEGRAL_PROJETO_INTEGRADOR.md`: Relatório completo alinhado ao PPC oficial da Fatec Diadema (2024/1).
5. `3-Semestre/docs_ia/GUIA_DESENVOLVIMENTO_MULTIMAQUINAS.md`: Guia de configuração de ambiente e sincronização para trabalhar em múltiplos computadores.

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
- **Release v0.2.0 (Sprint 2) — [PRÓXIMA ETAPA A INICIAR]:**
  - Micro Tarefa 1.2: Componente `ProtectedRoute.tsx` no React para proteção de rotas privadas.
  - Telas segregadas de Dashboard: `DashboardPaciente.tsx` e `DashboardMedico.tsx`.
  - Módulo de Credenciamento Médico: UC03 (Upload de CRM com validação de formato e tamanho) e UC04 (Aprovação/Reprovação por Perfil Admin).

---

## 7. Instruções de Inicialização para o Antigravity em Novo Computador / Sessão
Ao iniciar qualquer interação neste repositório:
1. Reconheça o Guilherme como PO e confirme que o contexto de governança e arquitetura foi carregado a partir deste arquivo.
2. Verifique o arquivo `3-Semestre/docs_ia/PLANO_DE_RELEASE_ACTIVE_AGE.md` para identificar exatamente onde paramos.
3. Não inicie implementação de código antes de:
   - Validar se o Guilherme já testou a release anterior;
   - Submeter a Spec Técnica da próxima micro tarefa para aprovação formal.
