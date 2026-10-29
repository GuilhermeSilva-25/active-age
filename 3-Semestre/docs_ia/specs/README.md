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
| **SPEC-03B** | **Micro Tarefa 2.2B: Melhorias no Dossiê (Frente/Verso, Máscaras e Código COMPE)** | UC03, UC04, UC05 | **Concluída / Live ✅** | [SPEC_SDD_MICRO_TAREFA_2.2B_MELHORIAS_DOSSIE_E_DADOS_BANCARIOS.md](./SPEC_SDD_MICRO_TAREFA_2.2B_MELHORIAS_DOSSIE_E_DADOS_BANCARIOS.md) |
| **SPEC-04** | **Micro Tarefa 2.3: Gestão de Usuários & Trilha de Auditoria Global (`audit_logs`)** | UC01, UC02, UC04, UC05 | **Concluída / Live ✅** | [SPEC_SDD_MICRO_TAREFA_2.3_GESTAO_USUARIOS_E_AUDITORIA.md](./SPEC_SDD_MICRO_TAREFA_2.3_GESTAO_USUARIOS_E_AUDITORIA.md) |
| **SPEC-04B** | **Caso de Uso UC05: Bloqueio Perimetral de Login e Revogação de Sessão (Moderação)** | UC05 | **Concluída / Live ✅** | [SPEC_SDD_UC05_BLOQUEIO_E_MODERACAO_DE_USUARIOS.md](./SPEC_SDD_UC05_BLOQUEIO_E_MODERACAO_DE_USUARIOS.md) |
| **SPEC-05** | **Micro Tarefa 2.4: Dashboards Segregados de Paciente e Médico** | UC01, UC02, UC03, UC07, UC08, UC09, UC10, UC12, UC14, UC16 | **Concluída / Live ✅** | [SPEC_SDD_MICRO_TAREFA_2.4_DASHBOARDS_PACIENTE_E_MEDICO.md](./SPEC_SDD_MICRO_TAREFA_2.4_DASHBOARDS_PACIENTE_E_MEDICO.md) |
| **SPEC-05B** | **Melhoria IHC: Padronização Universal de Spinners em Botões Assíncronos** | UC01, UC02, UC03, UC04, UC05 | **Concluída / Live ✅** | [SPEC_SDD_MELHORIA_IHC_PADRONIZACAO_SPINNERS_ASSINCRONOS.md](./SPEC_SDD_MELHORIA_IHC_PADRONIZACAO_SPINNERS_ASSINCRONOS.md) |
| **SPEC-05C** | **Semeador de Dados: Médicos Homologados em Homenagem aos Pioneiros da Tecnologia** | UC01, UC03, UC04, UC08, UC09 | **Concluída / Live ✅** | [SPEC_SDD_SEED_MEDICOS_HOMENAGEM_TECNOLOGIA.md](./SPEC_SDD_SEED_MEDICOS_HOMENAGEM_TECNOLOGIA.md) |
| **SPEC-06** | **Módulo de Gestão de Perfil do Usuário (Médico & Paciente) com Foto e Cuidador** | UC18 (RF014) | **Concluída / Live ✅** | [SPEC_SDD_GESTAO_DE_PERFIL_MEDICO_E_PACIENTE.md](./SPEC_SDD_GESTAO_DE_PERFIL_MEDICO_E_PACIENTE.md) |
| **SPEC-07** | **Vitrine e Busca Inteligente de Médicos Geriatras (Catálogo Neutro & Filtros)** | UC08 (RF005, RN004) | **Concluída / Live ✅** | [SPEC_SDD_UC08_BUSCA_MEDICO_GERIATRA.md](./SPEC_SDD_UC08_BUSCA_MEDICO_GERIATRA.md) |
| **SPEC-08** | **Submissão e Gestão de Exames Prévios pelo Paciente (Cofre Digital com GridFS)** | UC11 (RF008, RN007) | **Concluída / Live ✅** | [SPEC_SDD_UC11_SUBMETER_EXAMES_PREVIOS.md](./SPEC_SDD_UC11_SUBMETER_EXAMES_PREVIOS.md) |
| **SPEC-09** | **Gestão da Agenda Médica & Grade de Disponibilidade (Turnos e Slots)** | UC10 (RF006, RF007, RN001, RN008) | **Concluída / Live ✅** | [SPEC_SDD_UC10_GERENCIAR_AGENDA_MEDICA.md](./SPEC_SDD_UC10_GERENCIAR_AGENDA_MEDICA.md) |
| **SPEC-10** | **Agendamento Concorrente de Teleconsulta pelo Paciente (Reserva Atômica e Cancelamento Ético)** | UC09 (RF006, RF007, RN001, RN002) | **Concluída / Live ✅** | [SPEC_SDD_UC09_AGENDAR_TELECONSULTA.md](./SPEC_SDD_UC09_AGENDAR_TELECONSULTA.md) |

---

### 3. Próximas Especificações no Roadmap (Sprint 4 e 5)

* **SPEC-11 (Sprint 4 / Release v0.4.0):** Prontuário Ético Eletrônico Imutável, Visualização Médica de Exames e Assinatura Digital ICP-Brasil (UC13, UC14, UC15, UC16).
* **SPEC-12 (Sprint 5 / Release v0.5.0):** Microsserviços de Teleconsulta (WebRTC) e Gateway Financeiro com Split Direto (UC06, UC07, UC12, UC17).
