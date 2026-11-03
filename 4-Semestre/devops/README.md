# 🛠️ DevOps & Automação CI/CD — 4º Semestre
## Active Age — Plataforma Integral de Telessaúde Geriátrica
### Faculdade de Tecnologia de Diadema (Fatec Luigi Papaiz) — DSM 4º Semestre
**Disciplina:** Integração e Entrega Contínua (ISW-033)  
**Tech Lead:** Guilherme Silva | **Metodologia:** Spec-Driven Development (SDD)

---

### 1. Visão Geral deste Módulo

Esta pasta centraliza os artefatos de infraestrutura, containerização e esteiras de automação desenvolvidos no **4º Semestre**.

A pipeline real que executa no GitHub Actions reside na raiz do repositório em [`.github/workflows/ci-active-age.yml`](../../.github/workflows/ci-active-age.yml), e uma cópia de referência está espelhada aqui para fins didáticos e avaliação acadêmica.

---

### 2. Estrutura de Arquivos

* [`ci-active-age.template.yml`](./ci-active-age.template.yml): Espelho do workflow do GitHub Actions com matriz paralela, caching, Jacoco, Trivy e Docker;
* [`docs-pipeline.md`](./docs-pipeline.md): Guia passo a passo de como interpretar a execução, métricas e Quality Gates (SPEC-15);
* `docker-compose.infra.yml`: Orquestração local do ecossistema distribuído (em breve na SPEC-18).

---

### 3. Matriz de Execução da Pipeline Completa (Micro Tarefas 15.2, 15.3 e 15.4)

```mermaid
flowchart TD
    TRIG["Disparo:<br>Push / Pull Request / Manual"] --> FORK{"Matriz Paralela"}
    FORK --> BACK["Job 1: Backend Core<br>• Runner: Ubuntu Latest<br>• JDK 21 Temurin + Cache Maven<br>• Service: MongoDB 7.0<br>• Testes Automatizados: 180 testes (JUnit 5 + MockMvc)<br>• Cobertura: 84% Jacoco<br>• 100% das 45 Classes Auditadas<br>• Upload Artefatos: Surefire & Jacoco"]
    FORK --> FRONT["Job 2: Frontend SPA<br>• Runner: Ubuntu Latest<br>• Node 22 + Cache npm<br>• Auditoria: npm audit<br>• Linter: oxlint<br>• Build & Tipagem: Vite<br>• Upload Artefato: dist/"]
    BACK --> SEC["Job 3: DevSecOps & Container Docker<br>(needs: [backend-ci, frontend-ci])<br>• Scanner Trivy FS: Análise de CVEs em dependências<br>• Docker Buildx: Construção da imagem multi-stage<br>• Scanner Trivy Image: Auditoria da imagem Docker final"]
    FRONT --> SEC
```
