# SPEC-12B — Reformulação da Experiência de Teleconsulta, Prontuário Unificado e Receituário Clean P&B

- **Autor:** Guilherme Silva (PO & Tech Lead) & Antigravity (AI Pair Programmer)
- **Data de Aprovação:** 02 de Novembro de 2026
- **Status:** APROVADO / IMPLEMENTADO
- **Módulos:** `frontend-react` (`TeleconsultaRoom.tsx`, `DocumentPrintModal.tsx`, `MinhasConsultas.tsx`), `backend-core` (`MedicalRecordService.java`)
- **Conformidade:** Resoluções CFM nº 2.314/2022 e 2.336/2023, MP 2.200-2/2001 (ICP-Brasil/Gov.br) e WCAG 2.1 AA

---

## 1. Contexto e Motivação
A experiência de teleconsulta geriátrica exige sincronismo imediato entre médico e paciente, conformidade legal de prontuário eletrônico e impressão documental sóbria e legível para farmácias e laboratórios.

1. **Visão do Paciente na Sala Virtual:**
   - O card anterior redirecionava o idoso para fora da chamada antes da hora.
   - Agora, o paciente possui um painel integrado na própria sala que sincroniza em tempo real os documentos emitidos pelo médico nesta sessão.
   - Se nada foi gerado ainda, exibe: *"Nenhum documento emitido até o momento nesta sessão."*
2. **Ciclo de Vida da Teleconsulta:**
   - O paciente não pode encerrar a sessão médica; ele apenas possui o botão "Sair da Sala" que o retorna ao painel sem desativar a chamada.
   - A consulta é encerrada única e oficialmente quando o médico preenche e clica em **"Finalizar & Assinar Prontuário"**, atualizando o status do agendamento para `REALIZADA`.
3. **Prontuário Médico Unificado (Preparado para IA):**
   - Substituição de múltiplos formulários fragmentados por um **Card Único de Prontuário**, contendo dados do idoso no cabeçalho e um espaço estruturado para o médico redigir o relatório da consulta (anamnese, exame/inspeção, diagnóstico e conduta), preparado para futura transcrição e copiloto por IA.
4. **Emissão de Documentos e Template Clean Preto e Branco:**
   - Eliminação de textos mockados pré-preenchidos no formulário de receitas (utilizando apenas placeholders orientativos).
   - Template de impressão 100% Preto e Branco (P&B), sóbrio e profissional, preparado para assinatura digital Gov.br / ICP-Brasil com cabeçalho timbrado, corpo da prescrição e rodapé formal de autenticação.

---

## 2. Modificações no Backend (`MedicalRecordService.java`)
Ao finalizar e assinar o prontuário (`finalizeRecord`):
```java
appointmentRepository.findById(record.getAppointmentId()).ifPresent(appt -> {
    appt.setStatus(AppointmentStatus.REALIZADA);
    appt.setUpdatedAt(now);
    appointmentRepository.save(appt);
});
```
Isso assegura que a consulta só transiciona para o status concluído quando a obrigação ética do prontuário médico imutável é cumprida perante o CFM.

---

## 3. Modificações no Frontend (`frontend-react`)

### 3.1. `TeleconsultaRoom.tsx`
- Sincronização periódica da lista de documentos para o paciente.
- Painel de documentos emitidos na sessão para o idoso com atalho para impressão.
- Botão "Sair da Sala" para o paciente (sem alterar o status da consulta).
- Card Único de Prontuário com cabeçalho do paciente, área unificada para o relatório clínico e aviso de preparação para transcrição por IA.
- Limpeza dos campos de emissão de prescrição (conteúdo vazio e placeholder intuitivo).

### 3.2. `DocumentPrintModal.tsx`
- Redesenho completo para o modelo Clean Preto e Branco (P&B):
  - Cabeçalho institucional discreto com dados do médico e do paciente.
  - Título em caixa alta e prescrição com tipografia sóbria.
  - Footer com linha para assinatura, CRM, código de validação `AA-2026-XXXXXX` e selo de autenticidade ICP-Brasil / Gov.br.

### 3.3. `MinhasConsultas.tsx`
- O card de consultas exibe os documentos vinculados para impressão direta pelo paciente no seu painel de consultas.

---

## 4. Critérios de Aceite BDD

### BDD-01: Paciente visualiza documentos em tempo real e não encerra a chamada
- **Dado** que o paciente Dona Maria está na sala virtual,
- **Quando** o médico emitir uma prescrição,
- **Então** ela aparece no painel da sessão do paciente com botão de imprimir,
- **E** o paciente possui apenas a opção "Sair da Sala", mantendo o atendimento ativo.

### BDD-02: Consulta encerrada ao finalizar o prontuário
- **Dado** que o médico preenche o relatório da consulta no card único,
- **Quando** clica em "Finalizar & Assinar Prontuário",
- **Então** o prontuário torna-se imutável e a consulta passa para `REALIZADA`.

### BDD-03: Template de impressão estritamente Clean P&B
- **Dado** que qualquer documento emitido é visualizado para impressão,
- **Quando** o modal for aberto,
- **Então** a folha é renderizada em preto e branco com cabeçalho, conteúdo e rodapé formal de assinatura.

---

## 5. Registro de Auditoria e Commits
- Commit: `feat(teleconsulta): unifica prontuario para IA, template clean peb e fluxo seguro de encerramento (spec-12b)`

