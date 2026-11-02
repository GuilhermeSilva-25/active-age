# 📋 ESPECIFICAÇÃO TÉCNICA SDD — AJUSTE SPEC-12C
## Simplificação do Card de Prontuário & Detalhamento Arquitetural de IA e Assinatura Digital no Backlog Futuro

> **Status:** Proposta Técnica Submetida para Aprovação do PO (Guilherme Silva)  
> **Data:** 02/11/2026  
> **Contexto:** Plataforma Active Age — Módulo de Teleconsulta & Documentação de Futuras Releases  
> **Arquivos Envolvidos:**
> - `3-Semestre/frontend-react/src/pages/teleconsulta/TeleconsultaRoom.tsx`
> - `3-Semestre/docs_ia/BACKLOG_FUNCIONALIDADES_FUTURAS.md`

---

### 1. Motivação e Objetivos
1. **Limpeza e Foco Visual no Cockpit do Médico:**
   - Remover da aba de Prontuário o card informativo sobre IA (Copiloto Active Age), mantendo a interface estritamente focada na prática clínica imediata.
   - Remover a seção de seletores de parâmetros geriátricos rápidos (AGA) da tela, eliminando poluição visual e deixando o prontuário como um card único, direto e amplo para redação do relatório da consulta médica.
   - Preservar os valores padrão nos bastidores para integridade do DTO e persistência no MongoDB Atlas.
2. **Registro Formal e Detalhado no Backlog de Funcionalidades Futuras (`BACKLOG_FUNCIONALIDADES_FUTURAS.md`):**
   - **Assinatura Digital Avançada (Gov.br & ICP-Brasil):** Arquitetura de integração com assinatura qualificada Gov.br (níveis Prata/Ouro), certificados em nuvem (BirdID/SAFEID/VIDaaS), Carimbo do Tempo ICP-Brasil (ACT/ITI) e emissão de PDF com assinatura PAdES.
   - **Copiloto de IA no Prontuário Clínico:** Arquitetura do módulo de IA para transcrição de áudio em tempo real (Speech-to-Text), sumarização clínica estruturada automática, apoio diagnóstico e prerrogativa ética médica inegociável perante o CFM.

---

### 2. Mudanças Propostas

#### 2.1. Frontend (`TeleconsultaRoom.tsx`)
- **Remoção do Card de IA:** Exclusão do box gradiente `"Copiloto Clínico Active Age (Área Preparada para IA)"`.
- **Remoção dos Parâmetros Geriátricos da UI:** Exclusão do bloco `"Parâmetros Geriátricos Rápidos (AGA)"` e seus 4 selects (`cognitiveStatus`, `mobilityRisk`, `functionalIndependence`, `familySupport`).
- **Layout Resultante do Card Único:**
  1. **Cabeçalho:** Identificação do paciente, médico emitente, CRM e badge de status (Rascunho Ativo / Finalizado).
  2. **Área Ampla de Redação:** Label com ícone e `textarea` confortável com placeholder estruturado para evolução e conduta médica.
  3. **Hash SHA-256:** Exibido no rodapé apenas se o prontuário estiver finalizado.
  4. **Ações:** Botões táteis "Salvar Rascunho" e "Finalizar & Assinar Prontuário".

#### 2.2. Documento de Backlog (`BACKLOG_FUNCIONALIDADES_FUTURAS.md`)
- Adição da **Seção 6: Destaque: Assinatura Digital Avançada (Gov.br & Certificados ICP-Brasil)**:
  - Fluxo de integração Gov.br via OAuth2 e API oficial de assinatura de documentos;
  - Integração com provedores de certificado digital em nuvem (PSC / ITI);
  - Carimbo do Tempo (Timestamping) homologado pela ACT;
  - Padrão PAdES para preservação de longo prazo e validação no ITI (`validar.iti.gov.br`).
- Adição da **Seção 7: Destaque: Copiloto de Inteligência Artificial no Prontuário Clínico (IA Generativa & Assistente)**:
  - Transcrição contínua de áudio via WebRTC / Whisper / Gemini Live API;
  - Sumarização clínica em modelo SOAP / AGA geriátrica;
  - Sugestão contextual de CID-11;
  - Blindagem ética e legal: conformidade estrita com CFM (a IA é assistiva e jamais decisória autônoma; o médico revisa e assina).

---

### 3. Critérios de Aceite
- [ ] O Card de Prontuário do médico exibe apenas cabeçalho, textarea amplo de relatório e botões de ação.
- [ ] O card informativo da IA e os selects de parâmetros geriátricos foram removidos da tela.
- [ ] O salvamento de rascunho e finalização continuam funcionando perfeitamente sem erros de DTO no backend.
- [ ] `BACKLOG_FUNCIONALIDADES_FUTURAS.md` documenta minuciosamente a arquitetura de Assinatura Digital (Gov.br/ICP-Brasil) e IA no prontuário.
- [ ] Build do frontend `npm run build` passa com 0 erros.
- [ ] Commits realizados com Conventional Commits em português e push sincronizado.

