# 📋 CATÁLOGO DE ESPECIFICAÇÕES TÉCNICAS (SPECS SDD) — 4º SEMESTRE
## Active Age — Plataforma Integral de Telessaúde Geriátrica
### Faculdade de Tecnologia de Diadema (Fatec Luigi Papaiz) — DSM 4º Semestre
**Metodologia:** Spec-Driven Development (SDD) | **Tech Lead & PO:** Guilherme Silva

---

### 1. Governança e Regra de Ouro do SDD

Neste semestre, **nenhum arquivo de pipeline (YAML), Dockerfile, microsserviço ou código é criado sem uma Especificação Técnica detalhada (Spec) pré-aprovada pelo Product Owner (Guilherme)**. Cada entrega incremental gera um documento imutável arquivado nesta pasta.

---

### 2. Índice de Especificações Técnicas do 4º Semestre

| Código da Spec | Módulo / Escopo | Frentes Técnicas | Status | Documento Oficial |
|---|---|---|---|---|
| **SPEC-15** | **Pipeline de CI/CD Industrial no GitHub Actions & Quality Gates** | Triggers, Runners, Setup, Matriz Paralela, Lint, Testes, Cobertura Jacoco, Scanners de Segurança Trivy, Docker Multi-Stage e Step Summary | **Concluída / Live ✅** | [SPEC_SDD_PIPELINE_CICD_E_QUALITY_GATES.md](./SPEC_SDD_PIPELINE_CICD_E_QUALITY_GATES.md) |
| **SPEC-15B** | **Blindagem de Testes Automatizados & Expansão de Cobertura JaCoCo** | JUnit 5, Mockito, MockMvc, Sad Paths, Cobertura de Instruções 84% e Branches 56% (180 testes) | **Concluída / Live ✅** | [SPEC_SDD_BLINDAGEM_TESTES_E_COBERTURA_JACOCO.md](./SPEC_SDD_BLINDAGEM_TESTES_E_COBERTURA_JACOCO.md) |
| **SPEC-15C** | **Ajustes de Usabilidade: Foto da Paciente, Modais e Painel Admin** | Retrato humanizado no backend, hook useBodyScrollLock, modais responsivos e limpeza no admin | **Concluída / Live ✅** | [SPEC_SDD_AJUSTES_MODAIS_AVATAR_ADMIN.md](./SPEC_SDD_AJUSTES_MODAIS_AVATAR_ADMIN.md) |
| **SPEC-16** | **Microsserviço de Teleconsulta WebRTC Nativo (Signaling Server)** | Node.js, Socket.io, WebSockets, STUN/TURN e integração com a sala virtual | **Em Andamento (MT 16.1, 16.2 e 16.3 Concluídas ✅)** 🚀 | [SPEC_SDD_MICROSSERVICO_TELECONSULTA_WEBRTC.md](./SPEC_SDD_MICROSSERVICO_TELECONSULTA_WEBRTC.md) |
| **SPEC-16.2** | **Hub de Sinalização WebRTC & Gerenciamento de Salas** | Salas efêmeras, trava de 2 participantes, roteamento SDP/ICE e desconexão | **Concluída / Testada ✅** | [SPEC_SDD_MICRO_TAREFA_16.2_HUB_SINALIZACAO_SALAS.md](./SPEC_SDD_MICRO_TAREFA_16.2_HUB_SINALIZACAO_SALAS.md) |
| **SPEC-16.3** | **Cliente WebRTC no Frontend React 19 (`TeleconsultaRoom.tsx`)** | Hook `useWebRTC.ts`, STUN, feeds remoto/local PiP e controles táteis | **Concluída / Testada ✅** | [SPEC_SDD_MICRO_TAREFA_16.3_CLIENTE_WEBRTC_FRONTEND.md](./SPEC_SDD_MICRO_TAREFA_16.3_CLIENTE_WEBRTC_FRONTEND.md) |
| **SPEC-17** | **Microsserviço de Gateway de Pagamento & Split Direto BACEN** | API REST, Webhooks, Split Direto sem retenção e conformidade CFM nº 2.314/2022 | *Planejada* 📅 | Em breve |
| **SPEC-18** | **Orquestração de Containers e Infraestrutura Distribuída (Docker Compose)** | Redes isoladas, variáveis de ambiente seguras e deploy automatizado | *Planejada* 📅 | Em breve |

---
*Catálogo oficial em vigor a partir de 02 de Novembro de 2026.*  
*Projeto Integrador Active Age — Fatec Diadema.*

