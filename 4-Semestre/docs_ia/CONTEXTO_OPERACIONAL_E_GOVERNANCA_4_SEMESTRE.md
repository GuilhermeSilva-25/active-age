# CONTEXTO OPERACIONAL E GOVERNANÇA SDD — 4º SEMESTRE
## Active Age — Plataforma Integral de Telessaúde Geriátrica
### Faculdade de Tecnologia de Diadema (Fatec Luigi Papaiz) — DSM 4º Semestre
**Líder Técnico & Product Owner (PO):** Guilherme Silva  
**Arquiteto & Engenheiro de Implementação:** Antigravity (AI)  
**Metodologia Oficial:** Spec-Driven Development (SDD)

---

### 1. Finalidade deste Documento

Este documento estabelece as **leis fundamentais de engenharia, governança e operação técnica** para a execução do **4º Semestre** do projeto Active Age no Curso Superior de Tecnologia em Desenvolvimento de Software Multiplataforma (Fatec Diadema).

No 4º Semestre, a plataforma consolidou sua maturidade técnica com a transição para **Integração e Entrega Contínua (CI/CD)** e o desacoplamento de **Microsserviços Distribuídos Satélites** operando em conjunto com a base sólida construída no 3º Semestre.

---

### 2. Papéis e Governança no Projeto

| Papel | Responsável | Atribuições no 4º Semestre |
|---|---|---|
| **Product Owner (PO) / Líder Técnico** | **Você (Guilherme Silva)** | Definição de prioridades da esteira e dos microsserviços, validação das regras de negócio e de segurança, aprovação formal das Especificações Técnicas (Specs), autorização de commits/merges e homologação dos testes de aceite. |
| **Arquiteto de Software & Engenheiro DevOps** | **Antigravity (AI)** | Elaboração de Especificações Técnicas (Specs), estruturação de workflows do GitHub Actions, implementação de Quality Gates, desenvolvimento dos microsserviços em Node.js/Java, escrita de testes automatizados, orquestração Docker Compose e documentação contínua. |

---

### 3. As Leis Inegociáveis do SDD no 4º Semestre

1. **Regra de Ouro (Zero Código Sem Spec):** NENHUM arquivo de workflow YAML, script de CI/CD ou código de microsserviço pode ser criado ou alterado sem uma Especificação Técnica detalhada (Spec) pré-aprovada pelo Guilherme.
2. **Execução Passo a Passo com Testabilidade Imediata:** Cada micro tarefa deve produzir uma alteração isolada, compreensível e que possa ser imediatamente executada e testada no repositório.
3. **Imutabilidade e Respeito ao 3º Semestre:** Os arquivos de código do 3º Semestre (`3-Semestre/backend-core` e `3-Semestre/frontend-react`) são tratados como a **fundação estável homologada**. Qualquer melhoria ou ajuste neles preserva rigorosamente as regras éticas do CFM e a acessibilidade geriátrica já homologadas.
4. **Padrão de Commits:** Utilização estrita de *Conventional Commits* em **português**:
   * `ci(...)`: workflows, ações e esteiras de CI/CD;
   * `feat(...)`: nova funcionalidade em microsserviço ou infraestrutura;
   * `fix(...)`: correção de bug;
   * `docs(...)`: documentações técnicas e relatórios;
   * `test(...)`: testes automatizados e suítes de qualidade;
   * `refactor(...)`: refatoração sem alteração de comportamento.
5. **Rastreabilidade Persistente:** Toda spec do 4º Semestre é arquivada em `4-Semestre/docs_ia/specs/` com numeração sequencial a partir de **SPEC-15**.

---

### 4. Mapeamento dos Módulos do 4º Semestre

| Módulo | Escopo Técnico | Disciplina Fatec | Status |
|---|---|---|---|
| **M07: Esteira de CI/CD Industrial & Quality Gates** | Workflow GitHub Actions completo com 9 pilares (Triggers, Runners, Setup, Matriz, Linters, 233 Testes Maven/Vite, Cobertura Jacoco 84%, Scanners de Segurança Trivy, Docker Build e Step Summary). | Integração e Entrega Contínua (ISW-033) | **Concluído e Homologado (SPEC-15 & SPEC-15B) ✅** |
| **M08: Microsserviço de Teleconsulta WebRTC Nativo** | Servidor de sinalização dedicado (*Signaling Server* em Node.js/Socket.io com STUN/TURN) para vídeo/áudio P2P em tempo real de altíssima performance. | Arquitetura Orientada a Serviços (ILP-038) | **Concluído e Homologado (SPEC-16) ✅** |
| **M09: Microsserviço de Pagamento com Split Direto BACEN & Gestão SaaS** | Gateway de pagamento regulado pelo BACEN com liquidação instantânea sem dicotomia (Res. CFM nº 2.314/2022), faturamento SaaS e extratos P&B via Mercado Pago. | Arquitetura Orientada a Serviços (ILP-038) | **Concluído e Homologado (SPEC-17 a SPEC-17K) ✅** |
| **M10: Orquestração Multi-Container & Entrega Contínua (CD)** | `docker-compose.yml` raiz unificando os 4 microsserviços na rede `active-age-net` e publicação contínua no GitHub Container Registry (GHCR). | DevOps / Sistemas Distribuídos | **Concluído e Homologado (SPEC-18) ✅** |

---
*Documento homologado para o 4º Semestre.*  
*Projeto Integrador Active Age — Fatec Diadema DSM 2026.*
