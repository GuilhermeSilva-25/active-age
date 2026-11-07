# 📋 CATÁLOGO DE ESPECIFICAÇÕES TÉCNICAS (SPECS SDD) — 4º SEMESTRE
## Active Age — Plataforma Integral de Telessaúde Geriátrica
### Faculdade de Tecnologia de Diadema (Fatec Luigi Papaiz) — DSM 4º Semestre
**Metodologia:** Spec-Driven Development (SDD) | **Tech Lead & PO:** Guilherme Silva

---

### 1. Governança e Regra de Ouro do SDD

Neste semestre, **nenhum arquivo de pipeline (YAML), Dockerfile, microsserviço ou código é criado sem uma Especificação Técnica detalhada (Spec) pré-aprovada pelo Product Owner (Guilherme)**. Cada entrega incremental gera um documento imutável arquivado nesta pasta.

---

### 2. Índice de Especificações Técnicas do 4º Semestre (100% Concluídas ✅)

| Código da Spec | Módulo / Escopo | Frentes Técnicas | Status | Documento Oficial |
|---|---|---|---|---|
| **SPEC-15** | **Pipeline de CI/CD Industrial no GitHub Actions & Quality Gates** | Triggers, Runners, Setup, Matriz Paralela, Lint, Testes, Cobertura Jacoco, Scanners de Segurança Trivy, Docker Multi-Stage e Step Summary | **Concluída / Live ✅** | [SPEC_SDD_PIPELINE_CICD_E_QUALITY_GATES.md](./SPEC_SDD_PIPELINE_CICD_E_QUALITY_GATES.md) |
| **SPEC-15B** | **Blindagem de Testes Automatizados & Expansão de Cobertura JaCoCo** | JUnit 5, Mockito, MockMvc, Sad Paths, Cobertura de Instruções 84% e Branches 56% (180 testes) | **Concluída / Live ✅** | [SPEC_SDD_BLINDAGEM_TESTES_E_COBERTURA_JACOCO.md](./SPEC_SDD_BLINDAGEM_TESTES_E_COBERTURA_JACOCO.md) |
| **SPEC-15C** | **Ajustes de Usabilidade: Foto da Paciente, Modais e Painel Admin** | Retrato humanizado no backend, hook useBodyScrollLock, modais responsivos e limpeza no admin | **Concluída / Live ✅** | [SPEC_SDD_AJUSTES_MODAIS_AVATAR_ADMIN.md](./SPEC_SDD_AJUSTES_MODAIS_AVATAR_ADMIN.md) |
| **SPEC-16** | **Microsserviço de Teleconsulta WebRTC Nativo (Signaling Server)** | Node.js, Socket.io, WebSockets, STUN/TURN e integração com a sala virtual | **Concluída / Live ✅** | [SPEC_SDD_MICROSSERVICO_TELECONSULTA_WEBRTC.md](./SPEC_SDD_MICROSSERVICO_TELECONSULTA_WEBRTC.md) |
| **SPEC-16.2** | **Hub de Sinalização WebRTC & Gerenciamento de Salas** | Salas efêmeras, trava de 2 participantes, roteamento SDP/ICE e desconexão | **Concluída / Testada ✅** | [SPEC_SDD_MICRO_TAREFA_16.2_HUB_SINALIZACAO_SALAS.md](./SPEC_SDD_MICRO_TAREFA_16.2_HUB_SINALIZACAO_SALAS.md) |
| **SPEC-16.3** | **Cliente WebRTC no Frontend React 19 (`TeleconsultaRoom.tsx`)** | Hook `useWebRTC.ts`, STUN, feeds remoto/local PiP e controles táteis | **Concluída / Testada ✅** | [SPEC_SDD_MICRO_TAREFA_16.3_CLIENTE_WEBRTC_FRONTEND.md](./SPEC_SDD_MICRO_TAREFA_16.3_CLIENTE_WEBRTC_FRONTEND.md) |
| **SPEC-16.4** | **Resiliência de Rede, Fallbacks de Permissão e CI/CD** | ICE restart, reconexão automática, guia visual de cadeado e Docker CI | **Concluída / Testada ✅** | [SPEC_SDD_MICRO_TAREFA_16.4_RESILIENCIA_REDE_FALLBACKS_CI.md](./SPEC_SDD_MICRO_TAREFA_16.4_RESILIENCIA_REDE_FALLBACKS_CI.md) |
| **SPEC-17** | **Microsserviço de Gateway de Pagamento & Split Direto BACEN (Mercado Pago)** | API REST, Spring Boot 3, Split Direto 100% sem dicotomia (Res. CFM nº 2.314/2022) e faturamento SaaS | **Concluída / Live ✅** | [SPEC_SDD_MICROSSERVICO_GATEWAY_PAGAMENTO_SPLIT.md](./SPEC_SDD_MICROSSERVICO_GATEWAY_PAGAMENTO_SPLIT.md) |
| **SPEC-17B** | **Ecossistema Integral de Pagamentos Mercado Pago (3 Opções, Checkout Pro, Comprovante e Extrato)** | Pix, Cartão e Checkout Pro para Paciente e Médico, comprovante P&B timbrado e extrato consolidado | **Concluída / Live ✅** | [../../3-Semestre/docs_ia/specs/SPEC_SDD_PAGAMENTO_CHECKOUT_PRO_EXTRATO_E_AUDITORIA.md](../../3-Semestre/docs_ia/specs/SPEC_SDD_PAGAMENTO_CHECKOUT_PRO_EXTRATO_E_AUDITORIA.md) |
| **SPEC-17F** | **Refinamentos de UX, Prontuários, Agenda, Cronômetro e Checkout SaaS do Médico** | Cronômetro de plano ativo, travas de prontuário, agenda padronizada e checkout SaaS multietapas | **Concluída / Live ✅** | [../../3-Semestre/docs_ia/specs/SPEC_SDD_REFINAMENTOS_PAINEL_MEDICO_E_SAAS.md](../../3-Semestre/docs_ia/specs/SPEC_SDD_REFINAMENTOS_PAINEL_MEDICO_E_SAAS.md) |
| **SPEC-17G** | **Extrato P&B, Persistência de Faturas SaaS e Remoção da Tag Split** | Extrato contábil P&B timbrado com código digital `AA-SAAS-2026-XXXXXX` | **Concluída / Live ✅** | [../../3-Semestre/docs_ia/specs/SPEC_SDD_EXTRATO_MEDICO_P_E_B_E_SAAS.md](../../3-Semestre/docs_ia/specs/SPEC_SDD_EXTRATO_MEDICO_P_E_B_E_SAAS.md) |
| **SPEC-17H** | **Status Ativo de Assinatura SaaS e Extrato Exclusivo de Faturas** | Identificação reativa de plano regularizado (`[Ativo]`) e bloqueio de re-assinatura | **Concluída / Live ✅** | [../../3-Semestre/docs_ia/specs/SPEC_SDD_AJUSTES_STATUS_ASSINATURA_E_EXTRATO_SAAS_MEDICO.md](../../3-Semestre/docs_ia/specs/SPEC_SDD_AJUSTES_STATUS_ASSINATURA_E_EXTRATO_SAAS_MEDICO.md) |
| **SPEC-17I** | **Extrato SaaS Condicional Pós-Assinatura e Filtragem de Faturas Liquidadas** | Filtragem exclusiva de faturas aprovadas e estado vazio com CTA antes do pagamento | **Concluída / Live ✅** | [../../3-Semestre/docs_ia/specs/SPEC_SDD_FILTRAGEM_EXTRATO_SAAS_LIQUIDADO.md](../../3-Semestre/docs_ia/specs/SPEC_SDD_FILTRAGEM_EXTRATO_SAAS_LIQUIDADO.md) |
| **SPEC-17J** | **Prevenção de Flash e Padronização do Modal de Extrato com FeedbackModal** | Eliminação de FOUC com spinner tátil e alinhamento visual 100% com `FeedbackModal.tsx` | **Concluída / Live ✅** | [../../3-Semestre/docs_ia/specs/SPEC_SDD_PADRONIZACAO_MODAL_EXTRATO_E_PREVENCAO_FLASH.md](../../3-Semestre/docs_ia/specs/SPEC_SDD_PADRONIZACAO_MODAL_EXTRATO_E_PREVENCAO_FLASH.md) |
| **SPEC-17K** | **Remoção de Cifrão Residual na Aba de Documentos do Prontuário** | Correção de interpolação textual JSX em `MedicalRecordViewModal.tsx` | **Concluída / Live ✅** | [../../3-Semestre/docs_ia/PLANO_DE_RELEASE_ACTIVE_AGE.md](../../3-Semestre/docs_ia/PLANO_DE_RELEASE_ACTIVE_AGE.md) |
| **SPEC-18** | **Orquestração Multi-Container com Docker Compose & CD no GHCR** | `docker-compose.yml` unificando 4 serviços na rede `active-age-net`, Dockerfile Nginx e publicação no GHCR | **Concluída / Live ✅** | [../../3-Semestre/docs_ia/specs/SPEC_SDD_ORQUESTRACAO_DOCKER_COMPOSE_E_CD_GHCR.md](../../3-Semestre/docs_ia/specs/SPEC_SDD_ORQUESTRACAO_DOCKER_COMPOSE_E_CD_GHCR.md) |

---
*Catálogo oficial do 4º Semestre 100% concluído e homologado.*  
*Projeto Integrador Active Age — Fatec Diadema DSM 2026.*
