# 📋 CATÁLOGO OFICIAL DE ESPECIFICAÇÕES TÉCNICAS (SPECS SDD)
## Active Age — Plataforma Integral de Telessaúde Geriátrica
### Faculdade de Tecnologia de Diadema (Fatec Luigi Papaiz) — DSM 3º Semestre
**Metodologia:** Spec-Driven Development (SDD) | **Tech Lead / PO:** Guilherme Silva

---

### 1. Governança e Regra de Ouro do SDD

Neste projeto, **nenhuma funcionalidade é codificada sem uma Especificação Técnica detalhada (Spec) pré-aprovada pelo Product Owner (Guilherme)**. Cada entrega incremental gera um documento imutável de rastreabilidade arquivado nesta pasta.

---

### 2. Índice de Especificações Técnicas Concluídas

| Código da Spec | Módulo / Escopo | Casos de Uso | Status | Documento Oficial |
|---|---|---|---|---|
| **SPEC-01** | **Release v0.1.0: Fundação, Identidade e Autenticação Segura** | UC01, UC02 | **Concluída / Live ✅** | [SPEC_SDD_RELEASE_0.1.0_AUTENTICACAO_E_IDENTIDADE.md](./SPEC_SDD_RELEASE_0.1.0_AUTENTICACAO_E_IDENTIDADE.md) |
| **SPEC-02** | **Micro Tarefa 2.1: Blindagem RBAC, Layout Administrativo e Seed Admin** | UC01, UC02, UC04 | **Concluída / Live ✅** | [SPEC_SDD_MICRO_TAREFA_2.1_BLINDAGEM_RBAC_E_LAYOUT_ADMIN.md](./SPEC_SDD_MICRO_TAREFA_2.1_BLINDAGEM_RBAC_E_LAYOUT_ADMIN.md) |
| **SPEC-03** | **Micro Tarefa 2.2: Módulo de Credenciamento Médico Integral (Dossiê 4 Pilares e Auditoria Admin)** | UC03, UC04, UC05 | **Concluída / Live ✅** | [SPEC_SDD_MICRO_TAREFA_2.2_CREDENCIAMENTO_MEDICO.md](./SPEC_SDD_MICRO_TAREFA_2.2_CREDENCIAMENTO_MEDICO.md) |

---

### 3. Próximas Especificações no Roadmap (Sprint 2 em diante)

* **SPEC-04 (Micro Tarefa 2.3):** Gestão de Usuários & Trilha de Auditoria Global (`audit_logs`).
* **SPEC-05 (Micro Tarefa 2.4):** Dashboards Segregados de Paciente e Médico (`DashboardPaciente.tsx` e `DashboardMedico.tsx`).
* **SPEC-06 (Sprint 3 / Release v0.3.0):** Vitrine de Horários Livres e Agendamento Concorrente sem Double-Booking (UC08, UC09, UC10).
* **SPEC-07 (Sprint 4 / Release v0.4.0):** Prontuário Ético Eletrônico Imutável e Assinatura Digital ICP-Brasil (UC11, UC13, UC14, UC15, UC16).
* **SPEC-08 (Sprint 5 / Release v0.5.0):** Sala de Teleconsulta Integrada e Gateway com Split Direto (UC06, UC07, UC12, UC17).
