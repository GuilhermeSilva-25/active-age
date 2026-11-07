<p align="center">
  <img src="./1-Semestre/assets/logo-active-age.png" alt="Logo Active Age" width="500"/>
</p>

# 🩺 Active Age

**Plataforma Integral de Telessaúde Geriátrica & Ecossistema de Microsserviços Distribuídos**

Projeto de graduação em Desenvolvimento de Software Multiplataforma (DSM) — Faculdade de Tecnologia de Diadema (Fatec Luigi Papaiz).

---

## 📖 Sobre o Projeto

O **Active Age** transforma a experiência de cuidado da pessoa idosa, centralizando a jornada de saúde em um ambiente digital ético, acessível e seguro. A plataforma conecta pacientes idosos, cuidadores familiares e médicos geriatras, oferecendo:
* **Cockpit de Teleconsulta Integrada com Vídeo/Áudio P2P em Tempo Real (WebRTC nativo);**
* **Prontuário Eletrônico Imutável com Hash Criptográfico SHA-256 e Prescrições Digitais Verificáveis (`AA-2026-XXXXXX`);**
* **Gateway de Pagamento com Split Direto BACEN e Gestão SaaS (Mercado Pago);**
* **Esteira de CI/CD Industrial no GitHub Actions com 233 Testes Automatizados, Cobertura JaCoCo em 84% e Scanner Trivy;**
* **Orquestração Multi-Container com Docker Compose e Publicação Contínua no GitHub Container Registry (GHCR);**
* Rigorosa conformidade ética e legal com o **Conselho Federal de Medicina (CFM - Resoluções nº 2.314/2022 e 2.336/2023)**, **SBIS (NGS1/NGS2)**, acessibilidade **WCAG 2.1 AA** e **LGPD (Lei nº 13.709/2018)**.

---

## 🗂️ Estrutura do Repositório (Evolução por Semestres)

O projeto é construído iterativamente ao longo da graduação, aplicando Aprendizagem Baseada em Projetos (PBL):

- [📁 1º Semestre](./1-Semestre) — **Concluído ✅**: Fundamentação, Design e Prototipagem (Front-End Estático, IHC e Modelagem de Requisitos).
- [📁 2º Semestre](./2-Semestre) — **Concluído ✅**: Motor Relacional e Lógica de Negócio (Node.js, TypeScript, POO e MySQL com Docker).
- [📁 3º Semestre](./3-Semestre) — **Concluído ✅**: APIs RESTful Corporativas, NoSQL e Teleconsulta (Java 21 + Spring Boot 3, React 19 + TypeScript, MongoDB Atlas, Prontuário Imutável e Governança SDD).
- [📁 4º Semestre](./4-Semestre) — **Concluído ✅**: DevOps, CI/CD Industrial & Sistemas Distribuídos (GitHub Actions com 233 testes, JaCoCo 84%, Trivy, WebRTC Signaling em Node.js, Gateway de Pagamento & SaaS em Spring Boot, Orquestração Docker Compose e CD no GHCR).
- [📁 5º Semestre](./5-Semestre) — **Futuro 📅**: Próximo ano letivo.
- [📁 6º Semestre](./6-Semestre) — **Futuro 📅**: Próximo ano letivo.

---

## 🐳 Inicialização Rápida com Docker Compose (Comando Único)

Com a orquestração multi-container implementada na **SPEC-18**, toda a arquitetura de microsserviços pode ser inicializada localmente com um único comando na raiz do projeto:

```bash
# 1. Clonar o repositório
git clone https://github.com/GuilhermeSilva-25/active-age.git
cd active-age

# 2. Configurar as variáveis de ambiente
cp .env.example .env

# 3. Subir todos os 4 serviços integrados
docker compose up --build
```

### Serviços Inicializados:
| Serviço | Tecnologia | Porta | Descrição |
|---|---|---|---|
| **`frontend-react`** | React 19 + TypeScript + Nginx Alpine | `http://localhost:3000` | SPA acessível com suporte a SPA routing e proxy reverso |
| **`backend-core`** | Java 21 LTS + Spring Boot 3 + MongoDB | `http://localhost:8080` | API central clínica, agendamentos e prontuários |
| **`ms-teleconsulta-signaling`**| Node.js 22 LTS + Socket.io | `http://localhost:3001` | Servidor de sinalização WebRTC P2P |
| **`ms-pagamento-faturamento`** | Java 21 LTS + Spring Boot 3 + JPA | `http://localhost:8082` | Gateway financeiro BACEN & Faturamento SaaS |

---

## 🚀 Ambientes de Produção & Links Oficiais

* **Frontend SPA (Vercel):** Conectado com proxy reverso e rewrite de rotas `/api/*` diretamente para o Render.
* **Backend Core (Render):** `https://active-age-backend-mgyw.onrender.com`
* **Swagger API Docs (OpenAPI 3):** `https://active-age-backend-mgyw.onrender.com/swagger-ui/index.html`
* **Banco de Dados:** MongoDB Atlas (Cluster Replica Set na nuvem com soft delete e GridFS).
* **Esteira de CI/CD (GitHub Actions):** `.github/workflows/ci-active-age.yml` (9 Pilares, 233 testes, JaCoCo 84%, Trivy e GHCR).

---

## 🤖 Governança & Engenharia com IA (Spec-Driven Development - SDD)

O desenvolvimento segue a metodologia **Spec-Driven Development (SDD)**, com rastreabilidade total de requisitos, código e testes:
- 📋 [Regras & Contexto Operacional do Antigravity (GEMINI.md)](./GEMINI.md)
- 📑 [Catálogo de Especificações do 3º Semestre (SPEC-01 a SPEC-14)](./3-Semestre/docs_ia/specs)
- 📑 [Catálogo de Especificações do 4º Semestre (SPEC-15 a SPEC-18)](./4-Semestre/docs_ia/specs)
- 📘 [Guia Executivo da Pipeline de CI/CD & Quality Gates](./4-Semestre/devops/docs-pipeline.md)
- ⚖️ [Matriz de Conformidade Legal & Regulatória (CFM & LGPD)](./3-Semestre/docs_ia/MATRIZ_CONFORMIDADE_LEGAL_E_REGULATORIA_CFM_LGPD.md)
- 🚀 [Plano de Release & Roadmap de Sprints (v0.1.0 a v0.4.0 e 4º Semestre)](./3-Semestre/docs_ia/PLANO_DE_RELEASE_ACTIVE_AGE.md)
- 🧪 [Roteiro de Testes BDD (Modelo Oficial Fatec)](./3-Semestre/docs_ia/ROTEIRO_DE_TESTES_BDD_ACTIVE_AGE.md)
- 💻 [Guia de Desenvolvimento Multimáquinas & Onboarding](./3-Semestre/docs_ia/GUIA_DESENVOLVIMENTO_MULTIMAQUINAS.md)

---
*Projeto Integrador Active Age — Fatec Diadema (São Paulo).*  
*Tech Lead & Product Owner: Guilherme Silva.*
