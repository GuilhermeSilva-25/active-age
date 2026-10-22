# 🚀 3º Semestre: APIs RESTful, Prontuário Flexível & Governança SDD

**Status: Em Desenvolvimento** 🚧 | **Release v0.1.0 Homologada em Produção** ✅

## 🎯 Objetivo
Transformar o Active Age em uma plataforma corporativa em nuvem, substituindo o monólito relacional do 2º semestre por uma arquitetura moderna com Front-End SPA (React 19 + TypeScript + Tailwind CSS v4) e Back-End em Microsserviços/APIs RESTful (Java 21 + Spring Boot 3) integrado ao banco NoSQL (MongoDB Atlas), com foco absoluto em acessibilidade geriátrica (WCAG 2.1 AA), segurança (LGPD/CFM) e desenvolvimento orientado por especificações (Spec-Driven Development - SDD).

## 🛠️ Disciplinas Integradas (Fatec Diadema - DSM)
* **Desenvolvimento Web III:** Single Page Application (SPA) em React 19, TypeScript, Vite, Tailwind CSS v4 e React Router Dom v7.
* **Técnicas de Programação II:** Arquitetura em camadas com Java 21 LTS, Spring Boot 3, Spring Security, Jakarta Validation e Springdoc OpenAPI.
* **Banco de Dados Não-Relacional (NoSQL):** MongoDB Atlas (Replica Set na nuvem) com modelagem flexível de documentos BSON para prontuários clínicos.
* **Interface Humano-Computador (IHC):** Design System acessível para idosos com botões táteis ampliados (50px+), alto contraste e modais acessíveis (`FeedbackModal.tsx`).
* **Metodologia Ágil & Governança:** Spec-Driven Development (SDD), Conventional Commits e roteiro de testes executivos BDD.

## 📦 Estrutura de Pastas do Semestre
* [📁 `/backend-core`](./backend-core) - API RESTful em Spring Boot 3 + Java 21 LTS com Dockerfile multi-stage.
* [📁 `/frontend-react`](./frontend-react) - Aplicação SPA em React 19 + TypeScript + Vite + Tailwind CSS v4.
* [📁 `/docs`](./docs) - Especificação de produto, requisitos, arquitetura e modelos UML.
* [📁 `/docs_ia`](./docs_ia) - Documentação oficial do projeto (Governança SDD, Relatório de Análise Integral, Roteiro BDD, Plano de Release e Backlog Futuro).

## 🌐 Ambientes de Produção & Links Oficiais
* **Backend Core (Render):** `https://active-age-backend-mgyw.onrender.com`
* **Swagger API Docs:** `https://active-age-backend-mgyw.onrender.com/swagger-ui/index.html`
* **Frontend SPA (Vercel):** Conectado com proxy reverso e rewrite de rotas `/api/*` diretamente para o Render.
* **Banco de Dados:** MongoDB Atlas (Cluster na nuvem).

## 🚀 Como Executar Localmente
Consulte o [Guia de Desenvolvimento Multimáquinas](./docs_ia/GUIA_DESENVOLVIMENTO_MULTIMAQUINAS.md) para instruções completas de execução do backend e frontend em qualquer computador.
