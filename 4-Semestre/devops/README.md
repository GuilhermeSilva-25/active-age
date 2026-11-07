# 🛠️ DevOps, CI/CD Industrial & Orquestração Multi-Container — 4º Semestre
## Active Age — Plataforma Integral de Telessaúde Geriátrica
### Faculdade de Tecnologia de Diadema (Fatec Luigi Papaiz) — DSM 4º Semestre
**Disciplina:** Integração e Entrega Contínua (ISW-033) & Sistemas Distribuídos (ILP-038)  
**Tech Lead & PO:** Guilherme Silva | **Metodologia:** Spec-Driven Development (SDD)

---

### 1. Visão Geral deste Módulo

Esta pasta centraliza os artefatos de infraestrutura, containerização e esteiras de automação desenvolvidos no **4º Semestre**.

A pipeline industrial que executa no GitHub Actions reside na raiz do repositório em [`.github/workflows/ci-active-age.yml`](../../.github/workflows/ci-active-age.yml), e uma cópia de referência está espelhada aqui para fins didáticos e avaliação acadêmica da banca da Fatec.

---

### 2. Estrutura de Arquivos

* [`ci-active-age.template.yml`](./ci-active-age.template.yml): Espelho do workflow do GitHub Actions com matriz paralela, caching, Jacoco, Trivy, Docker e GHCR;
* [`docs-pipeline.md`](./docs-pipeline.md): Guia passo a passo de como interpretar a execução, métricas, relatórios Jacoco e Quality Gates (SPEC-15 & SPEC-18);
* [`docker-compose.yml`](../../docker-compose.yml): Orquestração raiz do ecossistema distribuído de microsserviços.

---

### 3. Matriz de Execução da Pipeline Completa (5 Jobs Paralelos + CD)

```mermaid
flowchart TD
    TRIG["Disparo:<br>Push / Pull Request / Manual"] --> FORK{"Matriz Paralela de Qualidade (CI)"}
    FORK --> BACK["Job 1: Backend Core<br>• Runner: Ubuntu Latest<br>• JDK 21 Temurin + Cache Maven<br>• Service: MongoDB 7.0<br>• Testes Automatizados: 184 testes (JUnit 5 + MockMvc)<br>• Cobertura: 84% Jacoco<br>• Upload Artefatos: Surefire & Jacoco"]
    FORK --> FRONT["Job 2: Frontend SPA<br>• Runner: Ubuntu Latest<br>• Node 22 + Cache npm<br>• Auditoria: npm audit<br>• Linter: oxlint<br>• Build & Tipagem: Vite<br>• Upload Artefato: dist/"]
    FORK --> SIG["Job 3: Signaling WebRTC<br>• Runner: Ubuntu Latest<br>• Node 22 + Vitest<br>• 10 Testes Automatizados<br>• Build de Produção TypeScript"]
    FORK --> PAG["Job 4: Payment & SaaS<br>• Runner: Ubuntu Latest<br>• Java 21 + Spring Boot 3<br>• 39 Testes JUnit 5 / MockMvc<br>• Cobertura Jacoco"]
    BACK --> SEC["Job 5: DevSecOps, Docker Compose & CD<br>(needs: [backend, frontend, signaling, payment])<br>• Validação: docker compose config<br>• Scanner Trivy FS: Análise de CVEs em dependências<br>• Docker Buildx: Construção das 4 imagens multi-stage<br>• Scanner Trivy Image: Auditoria das imagens finais<br>• Continuous Delivery (CD): Publicação de tags no GHCR<br>• GitHub Step Summary Executivo"]
    FRONT --> SEC
    SIG --> SEC
    PAG --> SEC
```

---

### 4. Como Executar os 4 Serviços com Docker Compose

```bash
# Na raiz do repositório:
cp .env.example .env
docker compose up --build
```

---
*Módulo de DevOps homologado para o 4º Semestre (ISW-033).*  
*Projeto Integrador Active Age — Fatec Diadema DSM 2026.*
