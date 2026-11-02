# ⚙️ 4º Semestre: DevOps, CI/CD & Microsserviços Distribuídos

**Status: Em Desenvolvimento** 🚀 | **Foco: Pipeline Industrial de CI/CD & Arquitetura de Microsserviços**

## 🎯 Objetivo do Semestre
Elevar a maturidade corporativa do ecossistema **Active Age**, implementando uma esteira de **Integração e Entrega Contínua (CI/CD)** com múltiplos *Quality Gates* (análise estática, testes automatizados, cobertura, segurança e observabilidade) aplicada sobre a base construída no 3º Semestre, e desenhar/implementar os novos **Microsserviços Distribuídos Satélites** (Teleconsulta Real com WebRTC nativo e Gateway de Pagamentos com Split Direto regulado pelo BACEN).

---

## 🛠️ Disciplinas Integradas (Fatec Diadema - DSM)
* **Integração e Entrega Contínua (CI/CD / DevOps - ISW-033):**
  * Construção e orquestração de pipelines automatizadas via **GitHub Actions**;
  * Definição de *Quality Gates* perimetrais (Linters, Testes Unitários e BDD, Cobertura com Jacoco, Scanners de Vulnerabilidades SAST/SCA);
  * Caching inteligente e matriz de execução paralela para otimização de tempo e recursos;
  * Geração e validação de containers Docker multi-stage e relatórios de observabilidade com `GITHUB_STEP_SUMMARY`.
* **Arquitetura Orientada a Serviços / Sistemas Distribuídos (ILP-038):**
  * Desacoplamento da aplicação core e criação de microsserviços satélites independentes;
  * **Microsserviço de Teleconsulta WebRTC:** Servidor de sinalização dedicado (*Signaling Server* em Node.js/Socket.io com STUN/TURN) para vídeo/áudio P2P em tempo real de altíssima performance;
  * **Microsserviço de Gateway & Split Direto:** Liquidação financeira instantânea com conformidade BACEN e vedação absoluta à dicotomia médica (Res. CFM nº 2.314/2022).
* **Metodologia Ágil & Governança SDD:**
  * Continuidade obrigatória da metodologia **Spec-Driven Development (SDD)**, com catalogação de especificações técnicas (`4-Semestre/docs_ia/specs/`), commits convencionais em português e revisões de qualidade passo a passo.

---

## 📦 Entregas Planejadas do 4º Semestre
1. **Pipeline de CI/CD Industrial no GitHub Actions (Core 3º Semestre + Novos Serviços):**
   * Gatilhos (`push`, `pull_request`, `workflow_dispatch`);
   * Runners Ubuntu com isolamento;
   * Checkout inteligente (`fetch-depth: 0`);
   * Setup de ambientes Java 21 LTS e Node.js 22 com caching de dependências (`.m2` e `npm`);
   * Quality Gates: Linters, Testes Maven/Vite, Cobertura de Código (Jacoco), Scanners de Segurança (Trivy / OWASP / CodeQL) e Docker Build multi-stage;
   * Matriz paralela de execução e sumário executivo de observabilidade (`GITHUB_STEP_SUMMARY`).
2. **Microsserviço de Teleconsulta WebRTC Nativo:**
   * Servidor de sinalização e comunicação em tempo real P2P para a sala virtual do Active Age.
3. **Microsserviço de Pagamento com Split Direto:**
   * Gateway de pagamento regulado pelo BACEN sem retenção de honorários na plataforma.

---

## 📂 Estrutura de Pastas do 4º Semestre
* [📁 `/devops`](./devops) — Documentação da pipeline, arquivos Docker Compose orquestrados e infraestrutura.
* [📁 `/microsservicos`](./microsservicos) — Código-fonte dos novos microsserviços do 4º Semestre.
* [📁 `/docs`](./docs) — Documentação técnica, arquitetura de sistemas distribuídos e modelos.
* [📋 `/docs_ia`](./docs_ia) — Governança SDD, Contexto Operacional do 4º Semestre e Catálogo de Especificações Técnicas (SPEC-15 em diante).
