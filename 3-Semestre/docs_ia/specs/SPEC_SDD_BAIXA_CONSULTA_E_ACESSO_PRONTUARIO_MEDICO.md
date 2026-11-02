# 📋 ESPECIFICAÇÃO TÉCNICA SDD — SPEC-13
## Baixa Automática de Consultas Finalizadas, Bloqueio de Reingresso e Acesso aos Prontuários pelo Médico

> **Status:** Proposta Técnica Submetida para Aprovação do PO (Guilherme Silva)  
> **Data:** 02/11/2026  
> **Contexto:** Plataforma Active Age — Encerramento de Teleconsultas, UX Pós-Atendimento e Cockpit do Médico  
> **Arquivos Envolvidos:**
> - `3-Semestre/backend-core/src/main/java/com/activeage/core/repositories/AppointmentRepository.java`
> - `3-Semestre/backend-core/src/main/java/com/activeage/core/services/AppointmentService.java`
> - `3-Semestre/backend-core/src/main/java/com/activeage/core/services/DoctorScheduleAutomationService.java`
> - `3-Semestre/frontend-react/src/pages/paciente/DashboardPaciente.tsx`
> - `3-Semestre/frontend-react/src/pages/teleconsulta/TeleconsultaRoom.tsx`
> - `3-Semestre/frontend-react/src/pages/medico/DashboardMedico.tsx`
> - `3-Semestre/frontend-react/src/components/teleconsulta/MedicalRecordViewModal.tsx` (Novo Componente)

---

### 1. Diagnóstico do Problema & Motivação

1. **Problema 1: Consulta Finalizada Permanecia Ativa no Dashboard do Paciente:**
   - **Causa Raiz 1 (Semeador/Automação):** O serviço de automação (`DoctorScheduleAutomationService.java`) verificava se existia consulta hoje com status `AGENDADA`. Ao ser finalizada pelo médico (passando para `REALIZADA`), o semeador interpretava que o dia de hoje estava vazio e criava automaticamente outra consulta agendada para hoje.
   - **Causa Raiz 2 (Dashboard do Paciente):** O endpoint `GET /api/patient/appointments/next` e o `DashboardPaciente.tsx` precisam garantir que consultas já `REALIZADA` nunca sejam exibidas como próximas consultas ativas com botão "Entrar na Sala Virtual".
   - **Causa Raiz 3 (Sala de Teleconsulta):** Se o paciente ou o médico acessasse `/teleconsulta/:id` de uma consulta `REALIZADA`, a página abria o feed de vídeo e controles como se a chamada estivesse ativa. É necessário um estado estrito de **"Atendimento Concluído"** que bloqueia câmera/microfone e exibe o resumo com documentos para download.

2. **Problema 2: Médico Não Consegue Acessar Prontuários e Informações Pós-Finalização:**
   - **Causa Raiz 1 (Backend do Médico):** O endpoint `GET /api/doctor/appointments/today` filtrava exclusivamente `AppointmentStatus.AGENDADA`. Assim que a consulta era finalizada, ela sumia da lista do médico.
   - **Causa Raiz 2 (Frontend do Médico):** O `DashboardMedico.tsx` só exibia o botão "Abrir Sala Virtual →". Não havia opção para o médico abrir o prontuário finalizado, consultar o relatório clínico, verificar o selo de autenticidade (hash SHA-256) ou reimprimir prescrições.

---

### 2. Solução Proposta

#### 2.1. Backend (`backend-core`)
1. **`DoctorScheduleAutomationService.java`:**
   - Em `ensureTodayActiveAppointment`: verificar se já existe consulta hoje com status `REALIZADA` para o paciente de teste. Se houver, registrar no log que o atendimento do dia foi concluído e **não** criar nova consulta agendada para hoje.
2. **`AppointmentRepository.java`:**
   - Adicionar método de busca por médico e intervalo de data:
     ```java
     List<Appointment> findByDoctorIdAndStartDateTimeBetweenOrderByStartDateTimeAsc(
         String doctorId, LocalDateTime start, LocalDateTime end
     );
     ```
3. **`AppointmentService.java`:**
   - Em `listDoctorTodayAppointments`: retornar todas as consultas do dia (tanto `AGENDADA` quanto `REALIZADA`), permitindo ao médico gerenciar a fila do dia e auditar os atendimentos já concluídos.

#### 2.2. Frontend — Dashboard do Paciente (`DashboardPaciente.tsx`)
- Filtrar `nextAppointment`: se o status for `REALIZADA`, desconsiderar e exibir o empty state humanizado *"Nenhuma consulta marcada no momento"*, orientando o paciente a agendar novos atendimentos ou consultar os documentos em *"Minhas Consultas"*.

#### 2.3. Frontend — Sala de Teleconsulta (`TeleconsultaRoom.tsx`)
- Se `appointment.status === 'REALIZADA'`:
  - Não inicializar áudio, vídeo, timer de chamada nem controles de microfone/câmera.
  - Renderizar a tela de **"Teleconsulta Concluída"**:
    - Selo de Atendimento Finalizado;
    - Dados do paciente e médico responsável;
    - Lista de receitas, atestados e pedidos de exame emitidos nesta sessão com botão de impressão em P&B (`DocumentPrintModal`);
    - Se for médico: visualização somente-leitura do prontuário preenchido com hash SHA-256;
    - Botão "Voltar ao Dashboard".

#### 2.4. Frontend — Dashboard do Médico (`DashboardMedico.tsx`)
- Na seção "Fila de Atendimentos de Hoje":
  - Se `app.status === 'AGENDADA'`: Badge verde "Confirmada" + Botão "Abrir Sala Virtual →";
  - Se `app.status === 'REALIZADA'`: Badge azul "Realizada" + Botão **"Ver Prontuário & Documentos"** (com ícone `FileText`);
- Criar o componente acessível [`MedicalRecordViewModal.tsx`](file:///c:/Users/guilh/OneDrive/Documentos/active-age/3-Semestre/frontend-react/src/components/teleconsulta/MedicalRecordViewModal.tsx):
  - Exibe os dados do paciente, relatório clínico da consulta, CID-11, data/hora da assinatura digital, hash SHA-256 imutável perante o CFM e lista de documentos emitidos com botão de impressão.

---

### 3. Critérios de Aceite
- [ ] Após o médico finalizar a consulta, ela sai imediatamente do topo do Dashboard do Paciente e a reentrada na vídeo chamada é terminantemente bloqueada.
- [ ] Ao acessar uma consulta realizada em `/teleconsulta/:id`, uma tela de atendimento concluído é exibida com os documentos emitidos.
- [ ] O semeador automático não sobrepõe novas consultas hoje caso a consulta do dia já tenha sido realizada.
- [ ] As consultas realizadas continuam visíveis no Dashboard do Médico com badge "Realizada".
- [ ] O médico consegue abrir o prontuário da consulta finalizada com um clique, conferindo o relatório clínico, o hash SHA-256 e os documentos emitidos.
- [ ] Build do Maven e do Vite passam com 0 erros.
- [ ] Commits realizados com Conventional Commits em português e push no GitHub.

