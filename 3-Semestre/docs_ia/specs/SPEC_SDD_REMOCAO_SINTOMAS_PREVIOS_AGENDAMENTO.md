# SPEC-11I — Remoção de Sintomas Prévios no Agendamento do Paciente

- **Autor:** Guilherme Silva (PO & Tech Lead) & Antigravity (AI Pair Programmer)
- **Data de Aprovação:** 02 de Novembro de 2026
- **Status:** APROVADO / IMPLEMENTADO
- **Módulos:** `frontend-react` (`AgendarConsultaModal.tsx`), `backend-core` (`DoctorScheduleAutomationService.java`)
- **Conformidade:** Resolução CFM nº 2.314/2022 (Ato Médico / Telemedicina) e WCAG 2.1 AA (Simplicidade Cognitiva)

---

## 1. Contexto e Motivação
Na jornada de telessaúde geriátrica do Active Age:
1. **Redução da Carga Cognitiva no Agendamento:** O paciente idoso ou seu cuidador familiar busca praticidade ao agendar uma consulta. Preencher campos textuais de sintomas antes de falar com o médico gerava fricção, ansiedade e duplicação de informações.
2. **Centralização da Anamnese no Ambiente Clínico:** A queixa principal, evolução dos sintomas e histórico clínico são atribuições do ato médico, pertencendo ao prontuário eletrônico no cockpit da teleconsulta (UC14 / Anamnese / AGA).
3. **Preparação para Gateway de Pagamento:** Com a retirada dos sintomas no agendamento, o fluxo fica linear: Selecionar Especialista -> Selecionar Vaga -> Confirmar (e futuramente Checkout com Split Direto sem dicotomia).

---

## 2. Modificações Implementadas

### 2.1. Frontend (`AgendarConsultaModal.tsx`)
- Remoção do estado `patientNotes` e do método `setPatientNotes`.
- Remoção do bloco JSX `textarea` "Motivo da Consulta ou Principais Sintomas (Opcional)".
- A requisição `POST /api/patient/appointments` envia estritamente `{ slotId: selectedSlotId }`.
- O modal passa a ter foco 100% na grade de datas e horários, habilitando o botão "Confirmar Agendamento" assim que o slot é selecionado.

### 2.2. Backend (`DoctorScheduleAutomationService.java`)
- No método de geração de teleconsultas automatizadas do médico e paciente de teste, o campo `patientNotes` passa a ser persistido como `null`.
- Implementada rotina de sanitização automática na inicialização para limpar quaisquer notas sintomáticas residuais de consultas geradas em versões anteriores no MongoDB Atlas.

---

## 3. Critérios de Aceite BDD

### BDD-01: Agendamento Direto sem Exigência de Sintomas
- **Dado** que o paciente Dona Maria abre o modal de agendamento de qualquer médico na vitrine,
- **Quando** o modal for renderizado,
- **Então** nenhum campo ou `textarea` de sintomas é exibido,
- **E** ao selecionar um horário livre, o botão "Confirmar Agendamento" fica ativo imediatamente.

### BDD-02: Consultas Semeadas Limpas de Sintomas
- **Dado** que o sistema inicializa ou executa a automação contínua de horários,
- **Quando** as consultas de teste forem verificadas ou geradas,
- **Então** o atributo `patientNotes` é nulo,
- **E** nas telas de "Minhas Consultas" e "Dashboard Médico", nenhum bloco de sintomas informados é renderizado.

---

## 4. Registro de Auditoria e Commits
- Commit: `feat(paciente): remove sintomas do agendamento centralizando anamnese na teleconsulta (spec-11i)`
