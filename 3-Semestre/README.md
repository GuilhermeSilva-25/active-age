# 🚀 3º Semestre: APIs RESTful, Prontuário Flexível & Governança SDD

**Status: Em Desenvolvimento** 🚧 | **Releases v0.1.0, v0.2.0 e v0.3.0 Homologadas em Produção** ✅

## 🎯 Objetivo
Transformar o Active Age em uma plataforma corporativa em nuvem, substituindo o monólito relacional do 2º semestre por uma arquitetura moderna com Front-End SPA (React 19 + TypeScript + Tailwind CSS v4) e Back-End em Microsserviços/APIs RESTful (Java 21 + Spring Boot 3) integrado ao banco NoSQL (MongoDB Atlas), com foco absoluto em acessibilidade geriátrica (WCAG 2.1 AA), segurança (LGPD/CFM) e desenvolvimento orientado por especificações (Spec-Driven Development - SDD).

## 🏆 Releases Entregues e Homologadas em Produção
* **v0.1.0 (Sprint 1):** Fundação da API RESTful, RBAC Base, Cadastro Médico com CRM, Criptografia BCrypt, Rate Limiting, Modais Acessíveis (`FeedbackModal.tsx`) e Deploy no Render + Vercel.
* **v0.2.0 (Sprint 2):** Credenciamento Médico Integral (Dossiê Ético em 4 Pilares), Fila de Auditoria do Admin, Gestão de Usuários com Trava Perimetral de Login, Trilha de Auditoria Imutável (`audit_logs`) e Dashboards Segregados de Médico e Paciente (WCAG 2.1 AA).
* **v0.3.0 (Sprint 3):** Gestão de Perfil com Foto e Cuidador, Vitrine Neutra de Médicos Geriatras (CFM Res. 2.336/2023), Gestão da Agenda Médica (Turnos e Slots), Agendamento Concorrente com Reserva Atômica (Anti Double-Booking), Política Ética de Cancelamento com 24h com Reciclagem de Slots, Semeador de Médico Teste com Automação Bi-Diária, 17 Médicos Pioneiros Homologados e Métricas Operacionais de Teleconsulta na Trilha de Auditoria do Administrador.

## 🛠️ Disciplinas Integradas (Fatec Diadema - DSM)
* **Desenvolvimento Web III:** Single Page Application (SPA) em React 19, TypeScript, Vite, Tailwind CSS v4 e React Router Dom v7.
* **Técnicas de Programação II:** Arquitetura em camadas com Java 21 LTS, Spring Boot 3, Spring Security, Jakarta Validation e Springdoc OpenAPI.
* **Banco de Dados Não-Relacional (NoSQL):** MongoDB Atlas (Replica Set na nuvem) com modelagem flexível de documentos BSON para prontuários clínicos e armazenamento via GridFS.
* **Interface Humano-Computador (IHC):** Design System acessível para idosos com botões táteis ampliados (50px+), alto contraste e modais acessíveis (`FeedbackModal.tsx`).
* **Metodologia Ágil & Governança:** Spec-Driven Development (SDD), Conventional Commits e roteiro de testes executivos BDD.

## 📦 Estrutura de Pastas do Semestre
* [📁 `/backend-core`](./backend-core) - API RESTful em Spring Boot 3 + Java 21 LTS com Dockerfile multi-stage.
* [📁 `/frontend-react`](./frontend-react) - Aplicação SPA em React 19 + TypeScript + Vite + Tailwind CSS v4.
* [📁 `/docs`](./docs) - Especificação de produto, requisitos, arquitetura e modelos UML.
* [📁 `/docs_ia`](./docs_ia) - Documentação oficial do projeto (Governança SDD, Relatório de Análise Integral, Roteiro BDD, Plano de Release e Backlog Futuro).
* [📋 `/docs_ia/specs`](./docs_ia/specs) - Catálogo oficial de Especificações Técnicas (SPEC-01 a SPEC-11C) homologadas pelo PO.

## 🌐 Ambientes de Produção & Links Oficiais
* **Backend Core (Render):** `https://active-age-backend-mgyw.onrender.com`
* **Swagger API Docs:** `https://active-age-backend-mgyw.onrender.com/swagger-ui/index.html`
* **Frontend SPA (Vercel):** Conectado com proxy reverso e rewrite de rotas `/api/*` diretamente para o Render.
* **Banco de Dados:** MongoDB Atlas (Cluster na nuvem).

## 🚀 Como Executar Localmente
Consulte o [Guia de Desenvolvimento Multimáquinas](./docs_ia/GUIA_DESENVOLVIMENTO_MULTIMAQUINAS.md) para instruções completas de execução do backend e frontend em qualquer computador.
