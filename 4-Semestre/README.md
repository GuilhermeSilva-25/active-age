# ⚙️ 4º Semestre: DevOps, CI/CD Industrial & Sistemas Distribuídos

**Status: Concluído** ✅ | **233 Testes Automatizados (0 Falhas) | JaCoCo 84% | Orquestração Docker Compose** 🏆

---

## 🎯 Objetivo Concluído
Elevar a maturidade corporativa e arquitetural do ecossistema **Active Age**, implementando:
1. Uma esteira de **Integração e Entrega Contínua (CI/CD)** com múltiplos *Quality Gates* (análise estática, testes automatizados, cobertura JaCoCo, segurança DevSecOps com Trivy, build multi-stage e publicação no GHCR);
2. A transição para uma **Arquitetura de Microsserviços Distribuídos Satélites** com desacoplamento de responsabilidades:
   - **Microsserviço de Teleconsulta WebRTC Nativo (`ms-teleconsulta-signaling`):** Sinalização em tempo real (Socket.io) para vídeo/áudio P2P de altíssimo desempenho;
   - **Microsserviço de Pagamento com Split Direto & SaaS (`ms-pagamento-faturamento`):** Gateway financeiro regulado pelo BACEN com liquidação instantânea sem dicotomia médica (Res. CFM nº 2.314/2022) e faturamento SaaS;
3. **Orquestração Multi-Container (`docker-compose.yml`):** Unificação de todos os 4 serviços em rede privada (`active-age-net`) com inicialização por comando único.

---

## 🛠️ Disciplinas Integradas (Fatec Diadema - DSM)
* **Integração e Entrega Contínua (CI/CD / DevOps - ISW-033):**
  * Construção e orquestração de pipelines automatizadas via **GitHub Actions** ([`.github/workflows/ci-active-age.yml`](../.github/workflows/ci-active-age.yml));
  * Matriz paralela com caching inteligente (`.m2` e `npm`), reduzindo o tempo de esteira;
  * Quality Gates: linters (`oxlint`), 233 testes automatizados (JUnit 5 + MockMvc + Vitest), cobertura de código JaCoCo (84% de instruções e 56% de branches em 45 classes);
  * DevSecOps: Scanner de segurança estática e CVEs de bibliotecas/containers via **Trivy CLI**;
  * Continuous Delivery (CD): Empacotamento Docker multi-stage dos 4 serviços e publicação contínua no **GitHub Container Registry (GHCR)**;
  * Observabilidade executiva automatizada com tabelas em Markdown no `GITHUB_STEP_SUMMARY`.
* **Arquitetura Orientada a Serviços / Sistemas Distribuídos (ILP-038):**
  * Desacoplamento da aplicação core e criação de microsserviços satélites independentes;
  * Servidor de sinalização WebRTC dedicado em Node.js 22 LTS / TypeScript com salas efêmeras e troca SDP/ICE;
  * Gateway financeiro independente em Java 21 LTS / Spring Boot 3 com Circuit Breaker (Resilience4j), cache Caffeine e integração com a API Oficial do Mercado Pago;
  * Orquestração de infraestrutura com rede bridge privada no Docker Compose.
* **Metodologia Ágil & Governança SDD:**
  * Continuidade obrigatória da metodologia **Spec-Driven Development (SDD)**, com catálogo de especificações técnicas ([`4-Semestre/docs_ia/specs/`](./docs_ia/specs)), commits convencionais em português e validações passo a passo.

---

## 📦 Entregas Realizadas no 4º Semestre

1. **Pipeline de CI/CD Industrial no GitHub Actions (SPEC-15 & SPEC-15B):**
   * Esteira com 9 pilares, runners Ubuntu, matriz paralela, 184 testes no Core, JaCoCo 84% de cobertura e scanner Trivy;
2. **Refinamentos de Usabilidade IHC & WCAG 2.1 AA (SPEC-15C):**
   * Retrato humanizado da Dona Maria, hook `useBodyScrollLock` contra scroll fantasma em modais táteis e higienização visual no painel do administrador;
3. **Microsserviço de Teleconsulta WebRTC Nativo (SPEC-16):**
   * Servidor de sinalização `ms-teleconsulta-signaling` com 10 testes automatizados Vitest, hook `useWebRTC.ts`, feeds remoto/local PiP, reconexão automática e resiliência de rede;
4. **Microsserviço de Pagamento com Split Direto BACEN & Gestão SaaS (SPEC-17 a SPEC-17K):**
   * Microsserviço `ms-pagamento-faturamento` com 39 testes JUnit/MockMvc;
   * 3 opções de pagamento para pacientes e médicos: Pix Instantâneo, Cartão de Crédito Transparente e Mercado Pago Checkout Pro;
   * Comprovante oficial de teleconsulta em Preto e Branco (P&B) timbrado com autenticação `AA-REC-2026-XXXXXX`;
   * Extrato financeiro contábil exclusivo de faturas SaaS (R$ 149,90) para o médico com código `AA-SAAS-2026-XXXXXX` e prevenção de re-assinatura;
   * Total de 233 testes automatizados em todo o repositório com 0 falhas!
5. **Orquestração Multi-Container & Entrega Contínua no GHCR (SPEC-18):**
   * Arquivo [`docker-compose.yml`](../docker-compose.yml) e template de ambiente [`.env.example`](../.env.example);
   * Containerização multi-stage do frontend com Nginx 1.27 Alpine;
   * Publicação contínua de imagens Docker no GitHub Container Registry (`ghcr.io/guilhermesilva-25/...`).

---

## 📂 Estrutura de Pastas do 4º Semestre
* [📁 `/devops`](./devops) — Documentação da pipeline de CI/CD, cópia de referência do workflow e guias de Quality Gates.
* [📁 `/docs`](./docs) — Arquitetura de sistemas distribuídos, diagrama de esteira e especificações de engenharia.
* [📁 `/docs_ia`](./docs_ia) — Governança SDD do 4º Semestre, Contexto Operacional e Catálogo de Specs (SPEC-15 a SPEC-18).
* [📁 `/ms-teleconsulta-signaling`](./ms-teleconsulta-signaling) — Microsserviço de sinalização WebRTC em Node.js 22 LTS / Socket.io.
* [📁 `/ms-pagamento-faturamento`](./ms-pagamento-faturamento) — Microsserviço de Gateway de Pagamento, Split BACEN e Gestão SaaS em Java 21 / Spring Boot 3.

---

## 🚀 Como Executar o Ecossistema do 4º Semestre

### Opção 1: Via Docker Compose (Recomendado — Comando Único)
```bash
# Na raiz do repositório:
cp .env.example .env
docker compose up --build
```

### Opção 2: Execução Individual dos Novos Microsserviços

```bash
# 1. Microsserviço de Sinalização WebRTC (Node.js)
cd 4-Semestre/ms-teleconsulta-signaling
npm install
npm run test     # Executa os 10 testes Vitest
npm run dev      # Roda na porta 3001

# 2. Microsserviço de Pagamento & SaaS (Spring Boot)
cd 4-Semestre/ms-pagamento-faturamento
./mvnw test      # Executa os 39 testes JUnit/MockMvc
./mvnw spring-boot:run # Roda na porta 8082
```

---
*Projeto Integrador Active Age — Fatec Diadema DSM 2026.*  
*Tech Lead & Product Owner: Guilherme Silva.*
