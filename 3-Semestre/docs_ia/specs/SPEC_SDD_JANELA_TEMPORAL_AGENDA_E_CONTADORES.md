# SPEC-11J — Correção da Janela Temporal da Agenda Médica e Dinamização Universal de Contadores

- **Autor:** Guilherme Silva (PO & Tech Lead) & Antigravity (AI Pair Programmer)
- **Data de Aprovação:** 02 de Novembro de 2026
- **Status:** APROVADO / IMPLEMENTADO
- **Módulos:** `frontend-react` (`MinhaAgenda.tsx`, `DashboardMedico.tsx`, `DashboardPaciente.tsx`), `backend-core` (`DoctorScheduleAutomationService.java`, `DoctorScheduleController.java`, `DoctorScheduleService.java`)
- **Conformidade:** Resoluções CFM nº 2.314/2022 e 2.336/2023, WCAG 2.1 AA (Visibilidade do Status e Eficiência de Uso)

---

## 1. Contexto e Diagnóstico

### 1.1. Inconsistência na Listagem da Agenda Médica (`MinhaAgenda.tsx`)
- **Causa Raiz:** O frontend enviava `startDate = now.toISOString()`. Em UTC ou horários avançados do dia, horários já decorridos ou matutinos do dia de hoje eram filtrados fora da busca pelo backend (`startDateTime >= startDate`).
- **Impacto Clínico:** Quando o médico filtrava por "Consultas Agendadas" (`OCUPADO`), a consulta confirmada de hoje desaparecia caso seu horário fosse anterior ao minuto da consulta ou houvesse defasagem de fuso horário.
- **Solução SPEC-11J:** Definir o início da janela temporal da agenda a partir das `00:00:00` da data local de hoje, garantindo que o médico visualize todos os atendimentos do seu dia completo.

### 1.2. Contadores Estáticos
- No `DashboardMedico.tsx`:
  - "Atendimentos Hoje" exibia `0` estático em vez de refletir as consultas do dia.
  - "Pacientes" exibia `0` estático em vez do total real de pacientes da carteira médica.
- No `DashboardPaciente.tsx`:
  - O card de horários exibia texto fixo "0 consultas pendentes" mesmo com teleconsulta confirmada.
- Na `MinhaAgenda.tsx`:
  - As abas de filtro não possuíam badges indicativos do quantitativo de vagas e agendamentos.

---

## 2. Implementações Arquiteturais

### 2.1. Backend Core (`backend-core`)
1. **DTO `DoctorDashboardStatsResponse`:**
   - `todayAppointments`: Total de consultas do dia de hoje com status `AGENDADA`.
   - `totalPatients`: Contagem de pacientes distintos com consultas vinculadas a este médico.
   - `totalAppointments`: Volume histórico de agendamentos.
   - `freeSlots`: Total de slots livres disponíveis na vitrine.
   - `trialDaysRemaining`: Dias restantes do período de degustação SaaS de 15 dias.
2. **Endpoint `GET /api/doctor/stats`:**
   - Adicionado no `DoctorScheduleController` com `@PreAuthorize("hasRole('MEDICO')")`.
3. **Sincronização Atômica na Automação (`DoctorScheduleAutomationService.java`):**
   - Garantir que a consulta de hoje atualize atomicamente o slot da grade correspondente com `status: OCUPADO`, `appointmentId`, `patientId` e `patientName`.

### 2.2. Frontend React (`frontend-react`)
1. **`MinhaAgenda.tsx`:**
   - Janela temporal iniciando em `YYYY-MM-DDT00:00:00` do dia local.
   - Badges de contagem em cada botão de filtro (`Todos`, `Livres`, `Consultas Agendadas`, `Bloqueados`).
   - Botão direto "Abrir Sala Virtual →" no card do slot ocupado com teleconsulta confirmada.
2. **`DashboardMedico.tsx`:**
   - Consumo do endpoint `/api/doctor/stats`.
   - Card 1 ("Atendimentos Hoje") conectado reativamente.
   - Card 2 ("Pacientes") conectado à volumetria de pacientes únicos.
   - Card 3 ("Assinatura SaaS") exibindo os dias reais restantes da degustação.
3. **`DashboardPaciente.tsx`:**
   - Texto dinâmico: `nextAppointment ? '1 consulta confirmada' : '0 consultas pendentes'`.

---

## 3. Critérios de Aceite BDD

### BDD-01: Exibição da Consulta de Hoje na Aba "Consultas Agendadas"
- **Dado** que o médico de teste acessa `/medico/agenda`,
- **Quando** seleciona a aba "Consultas Agendadas",
- **Então** o atendimento da paciente Dona Maria para o dia de hoje é exibido com horário, nome da paciente e botão "Abrir Sala Virtual →".

### BDD-02: Dinamismo de Todos os Contadores do Consultório
- **Dado** que o médico possui consultas ativas e pacientes no MongoDB,
- **Quando** o `DashboardMedico` for renderizado,
- **Então** "Atendimentos Hoje" exibe o quantitativo real de hoje,
- **E** "Pacientes" exibe o número de pacientes únicos.

---

## 4. Registro de Auditoria e Commits
- Commit: `feat(medico): corrige janela temporal da agenda e dinamiza contadores (spec-11j)`
