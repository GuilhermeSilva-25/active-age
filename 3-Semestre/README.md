# 🚀 3º Semestre: APIs RESTful, Prontuário Flexível & Governança SDD

**Status: Concluído** ✅ | **Releases v0.1.0, v0.2.0, v0.3.0 e v0.4.0 Homologadas em Produção** 🏆

## 🎯 Objetivo Concluído
Transformar o Active Age em uma plataforma corporativa em nuvem, substituindo o monólito relacional do 2º semestre por uma arquitetura moderna com Front-End SPA (React 19 + TypeScript + Tailwind CSS v4) e Back-End em Microsserviços/APIs RESTful (Java 21 + Spring Boot 3) integrado ao banco NoSQL (MongoDB Atlas), com foco absoluto em acessibilidade geriátrica (WCAG 2.1 AA), conformidade ético-médica (CFM / SBIS / LGPD) e desenvolvimento rigorosamente orientado por especificações (Spec-Driven Development - SDD).

## 🏆 Releases Entregues e Homologadas em Produção
* **v0.1.0 (Sprint 1):** Fundação da API RESTful, RBAC Base, Cadastro Médico com CRM, Criptografia BCrypt, Rate Limiting perimetral com Bucket4j, Modais Acessíveis (`FeedbackModal.tsx`) e Deploy contínuo no Render + Vercel.
* **v0.2.0 (Sprint 2):** Credenciamento Médico Integral (Dossiê Ético em 4 Pilares: Habilitação, Regularidade Ética, Telemedicina ICP-Brasil e Dados Financeiros), Fila de Auditoria do Admin com aprovação/rejeição justificada, Gestão de Usuários com Trava Perimetral de Login, Trilha de Auditoria Imutável (`audit_logs`) e Dashboards Segregados de Médico e Paciente (WCAG 2.1 AA).
* **v0.3.0 (Sprint 3):** Gestão de Perfil com Foto e Cuidador Familiar (RF014 / UC18), Vitrine Neutra de Médicos Geriatras (CFM Res. 2.336/2023), Gestão da Agenda Médica em Lote (Turnos e Slots), Agendamento Concorrente com Reserva Atômica (Anti Double-Booking), Política Ética de Cancelamento com 24h e Reciclagem de Slots, Semeador de Médico Teste com Automação Bi-Diária, 17 Médicos Pioneiros Homologados, Dicas Dinâmicas de Longevidade Ativa e Métricas Operacionais de Teleconsulta na Trilha de Auditoria do Administrador.
* **v0.4.0 (Sprint 4 - Conclusão do Semestre):** Cockpit Integrado de Teleconsulta com experiência responsiva computador/mobile (UC12-Demo), Prontuário Ético Eletrônico Geriátrico Imutável com assinatura e hash criptográfico SHA-256 (UC14 / RN003), Visualização Médica dos Exames e Laudos do Idoso anexados no MongoDB GridFS (UC13), Emissão de Documentos e Receitas Médicas Digitais com código seguro verificador `AA-2026-XXXXXX` e template limpo P&B para impressão/PDF Gov.br (UC15), Painel do Paciente para Consulta e Impressão de Documentos Oficiais (UC16), Validador Público de Prescrições e Atestados perante o CRM e ICP-Brasil (`/validar-documento`), Sala de Teleconsulta com Card Único e fluxo seguro de encerramento sem bloqueio acidental, Baixa Automática de Consultas Realizadas e Central de Prontuários & Prescrições Digitais no Dashboard do Médico (SPEC-14).

## 🛠️ Disciplinas Integradas (Fatec Diadema - DSM)
* **Desenvolvimento Web III:** Single Page Application (SPA) em React 19, TypeScript, Vite, Tailwind CSS v4 e React Router Dom v7.
* **Técnicas de Programação II:** Arquitetura em camadas com Java 21 LTS, Spring Boot 3, Spring Security, Jakarta Validation e Springdoc OpenAPI.
* **Banco de Dados Não-Relacional (NoSQL):** MongoDB Atlas (Replica Set na nuvem) com modelagem flexível de documentos BSON para prontuários clínicos e armazenamento binário via GridFS.
* **Interface Humano-Computador (IHC):** Design System acessível para idosos com botões táteis ampliados (50px+), alto contraste, leitura semântica ARIA e modais acessíveis (`FeedbackModal.tsx`), abolindo `window.alert()`.
* **Metodologia Ágil & Governança:** Spec-Driven Development (SDD), Conventional Commits estritamente em português e roteiro executivo de testes BDD (modelo oficial Fatec).

## 📦 Estrutura de Pastas do Semestre
* [📁 `/backend-core`](./backend-core) - API RESTful em Spring Boot 3 + Java 21 LTS com Dockerfile multi-stage.
* [📁 `/frontend-react`](./frontend-react) - Aplicação SPA em React 19 + TypeScript + Vite + Tailwind CSS v4.
* [📁 `/docs`](./docs) - Especificação de produto, requisitos, arquitetura e modelos UML.
* [📁 `/docs_ia`](./docs_ia) - Documentação oficial do projeto (Governança SDD, Relatório de Análise Integral, Roteiro BDD, Plano de Release e Backlog Futuro).
* [📋 `/docs_ia/specs`](./docs_ia/specs) - Catálogo oficial de Especificações Técnicas (SPEC-01 a SPEC-14) homologadas pelo PO.

## 🌐 Ambientes de Produção & Links Oficiais
* **Backend Core (Render):** `https://active-age-backend-mgyw.onrender.com`
* **Swagger API Docs:** `https://active-age-backend-mgyw.onrender.com/swagger-ui/index.html`
* **Frontend SPA (Vercel):** Conectado com proxy reverso e rewrite de rotas `/api/*` diretamente para o Render.
* **Banco de Dados:** MongoDB Atlas (Cluster na nuvem com réplica).

## 🚀 Como Executar Localmente
Consulte o [Guia de Desenvolvimento Multimáquinas](./docs_ia/GUIA_DESENVOLVIMENTO_MULTIMAQUINAS.md) para instruções completas de execução do backend e frontend em qualquer computador.
