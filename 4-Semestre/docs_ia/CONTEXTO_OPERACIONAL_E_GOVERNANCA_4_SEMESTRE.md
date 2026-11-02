# CONTEXTO OPERACIONAL E GOVERNANÇA SDD — 4º SEMESTRE
## Active Age — Plataforma Integral de Telessaúde Geriátrica
### Faculdade de Tecnologia de Diadema (Fatec Luigi Papaiz) — DSM 4º Semestre
**Líder Técnico & Product Owner (PO):** Guilherme Silva  
**Arquiteto & Engenheiro de Implementação:** Antigravity (AI)  
**Metodologia Oficial:** Spec-Driven Development (SDD)

---

### 1. Finalidade deste Documento

Este documento estabelece as **leis fundamentais de engenharia, governança e operação técnica** para a execução do **4º Semestre** do projeto Active Age no Curso Superior de Tecnologia em Desenvolvimento de Software Multiplataforma (Fatec Diadema).

No 4º Semestre, a plataforma expande sua maturidade técnica com a transição para **Integração e Entrega Contínua (CI/CD)** e o desacoplamento de **Microsserviços Distribuídos Satélites** operando em conjunto com a base sólida construída no 3º Semestre.

---

### 2. Papéis e Governança no Projeto

| Papel | Responsável | Atribuições no 4º Semestre |
|---|---|---|
| **Product Owner (PO) / Líder Técnico** | **Você (Guilherme Silva)** | Definição de prioridades da esteira e dos microsserviços, validação das regras de negócio e de segurança, aprovação formal das Especificações Técnicas (Specs), autorização de commits/merges e homologação dos testes de aceite. |
| **Arquiteto de Software & Engenheiro DevOps** | **Antigravity (AI)** | Elaboração de Especificações Técnicas (Specs), estruturação de workflows do GitHub Actions, implementação de Quality Gates, desenvolvimento dos microsserviços em Node.js/Java, escrita de testes e documentação contínua. |

---

### 3. As Leis Inegociáveis do SDD no 4º Semestre

1. **Regra de Ouro (Zero Código Sem Spec):** NENHUM arquivo de workflow YAML, script de CI/CD ou código de microsserviço pode ser criado ou alterado sem uma Especificação Técnica detalhada (Spec) pré-aprovada pelo Guilherme.
2. **Execução Passo a Passo com Testabilidade Imediata:** Cada micro tarefa deve produzir uma alteração isolada, compreensível e que possa ser imediatamente executada e testada no repositório.
3. **Imutabilidade e Respeito ao 3º Semestre:** Os arquivos de código do 3º Semestre (`3-Semestre/backend-core` e `3-Semestre/frontend-react`) são tratados como a **fundação estável homologada**. Qualquer melhoria ou ajuste neles deve preservar rigorosamente as regras éticas do CFM e a acessibilidade geriátrica já homologadas.
4. **Padrão de Commits:** Utilização estrita de *Conventional Commits* em **português**:
   * `ci(...)`: workflows, ações e esteiras de CI/CD;
   * `feat(...)`: nova funcionalidade em microsserviço;
   * `fix(...)`: correção de bug;
   * `docs(...)`: documentações técnicas e relatórios;
   * `test(...)`: testes automatizados e suítes de qualidade;
   * `refactor(...)`: refatoração sem alteração de comportamento.
5. **Rastreabilidade Persistente:** Toda spec do 4º Semestre é arquivada em `4-Semestre/docs_ia/specs/` com numeração sequencial a partir de **SPEC-15**.

---

### 4. Mapeamento dos Módulos do 4º Semestre

| Módulo | Escopo Técnico | Disciplina Fatec | Status |
|---|---|---|---|
| **M07: Esteira de CI/CD Industrial & Quality Gates** | Workflow GitHub Actions completo com 9 pilares (Triggers, Runners, Setup, Matriz, Linters, Testes Maven/Vite, Cobertura Jacoco, Scanners de Segurança Trivy/OWASP, Docker Build e Step Summary). | Integração e Entrega Contínua (ISW-033) | **Em Planejamento (SPEC-15)** 🚀 |
| **M08: Microsserviço de Teleconsulta WebRTC Nativo** | Servidor de sinalização dedicado (*Signaling Server* em Node.js/Socket.io com STUN/TURN) para vídeo/áudio P2P em tempo real de altíssima performance. | Arquitetura Orientada a Serviços (ILP-038) | Planejado 📅 |
| **M09: Microsserviço de Pagamento com Split Direto** | Gateway de pagamento regulado pelo BACEN com liquidação instantânea de honorários médicos sem dicotomia (Res. CFM nº 2.314/2022). | Arquitetura Orientada a Serviços (ILP-038) | Planejado 📅 |
| **M10: Orquestração e Infraestrutura Distribuída** | `docker-compose.infra.yml` unificando o ecossistema com redes isoladas e variáveis parametrizadas. | DevOps / Sistemas Distribuídos | Planejado 📅 |

---

### 5. Definition of Done (DoD) para a Pipeline de CI/CD

Uma tarefa da pipeline só é considerada **CONCLUÍDA** quando:
- [ ] O workflow YAML for validado sintaticamente e semanticamente;
- [ ] A execução rodar com status **verde (Success)** no GitHub Actions;
- [ ] Os tempos de build utilizarem cache comprovadamente eficiente;
- [ ] O relatório visual no `$GITHUB_STEP_SUMMARY` for gerado com informações claras;
- [ ] O Guilherme entender perfeitamente o funcionamento de cada etapa testada.

---
*Documento aprovado e em vigor a partir de 02 de Novembro de 2026.*  
*Projeto Integrador Active Age — Fatec Diadema.*

