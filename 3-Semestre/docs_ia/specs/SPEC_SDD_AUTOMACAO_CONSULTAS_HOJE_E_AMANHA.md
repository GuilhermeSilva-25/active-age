# SPEC-11E: Automação Contínua de Grade e Consultas Ativas para Hoje e Amanhã
## Metodologia: Spec-Driven Development (SDD)
### Projeto: Active Age — Telessaúde Geriátrica Integral (DSM / Fatec Diadema)

---

## 1. Contexto & Motivação
A plataforma Active Age conta com uma automação contínua (`DoctorScheduleAutomationService.java`) responsável por manter a conta do **Médico Teste** (`medico@teste.com`) e da **Paciente Teste** (`paciente@teste.com`) prontas para testes práticos e bancas avaliadoras.

Contudo, foram identificados os seguintes bloqueios operacionais:
1. **Filtro de Horários Futuros (`listPublicAvailability`):** A grade de horários fixos `{9, 10, 11, 14, 15, 16, 17}` causava o descarte total dos horários de hoje quando os testes eram realizados no fim da tarde ou à noite, exibindo apenas o dia de amanhã no modal de agendamento.
2. **Horário Estático da Consulta de Teste às 14:00:** A consulta de hoje era gravada com horário fixo às 14:00. Testes após as 14:00 faziam com que `/api/patient/appointments/next` retornasse vazio e `MinhasConsultas.tsx` movesse a consulta para o histórico encerrado.
3. **Fuso Horário UTC do Servidor em Nuvem (Render):** O container Docker executa em UTC (+3h em relação a Brasília), antecipando a expiração dos horários e a virada de data em 3 horas.
4. **Ausência de Consulta Ativa para o Dia Seguinte:** Apenas slots livres eram gerados para o dia de amanhã, sem nenhum atendimento confirmado agendado para o dia seguinte.

---

## 2. Objetivos
1. Estabelecer fuso horário oficial de Brasília (`America/Sao_Paulo`) globalmente na aplicação Spring Boot.
2. Expandir a grade diária de horários livres para cobrir a faixa matutina, vespertina e noturna (`08:00` às `22:00`).
3. Garantir **pelo menos UMA consulta confirmada ativa (`AppointmentStatus.AGENDADA`) para o dia de HOJE**, com horário futuro em relação ao momento de acesso (evitando que expire na tela do paciente).
4. Garantir **pelo menos UMA consulta confirmada ativa (`AppointmentStatus.AGENDADA`) para o dia de AMANHÃ** (ex: às 14:00).
5. Validar os cenários com testes unitários no `DoctorScheduleAutomationServiceTest.java`.

---

## 3. Especificação Técnica dos Componentes

### 3.1. Timezone Global (`ActiveAgeCoreApplication.java`)
* Inclusão do método `@PostConstruct` definindo `TimeZone.setDefault(TimeZone.getTimeZone("America/Sao_Paulo"))`.

### 3.2. Grade de Horários Livres (`DoctorScheduleAutomationService.java`)
* Constante `APPOINTMENT_HOURS = {8, 9, 10, 11, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22}`.
* Geração de slots `SlotStatus.LIVRE` para `dayOffset = 0` (hoje) e `dayOffset = 1` (amanhã).

### 3.3. Garantia de Consultas Ativas (`ensureActiveAppointments`)
* **Hoje:**
  * Busca consultas com status `AGENDADA` entre `startOfToday` e `endOfToday`.
  * Se não existir, ou se a consulta existente tiver seu `startDateTime` no passado em relação a `LocalDateTime.now()`, ajusta/cria o atendimento para um horário futuro no dia de hoje (ex: `now.plusMinutes(30)` ou `20:00`), mantendo o slot associado como `OCUPADO`.
* **Amanhã:**
  * Busca consultas com status `AGENDADA` entre `startOfTomorrow` e `endOfTomorrow`.
  * Se não existir, cria consulta confirmada para as 14:00 de amanhã com slot `OCUPADO`.

### 3.4. Testes Automatizados
* Atualização da suíte de testes unitários mockados garantindo que tanto hoje quanto amanhã possuam consultas ativas geradas/mantidas.

---

## 4. Critérios de Aceite
- [x] O fuso horário de Brasília está ativo na JVM.
- [x] A modal de agendamento exibe horários livres tanto para hoje quanto para amanhã.
- [x] O `DashboardPaciente.tsx` e o `DashboardMedico.tsx` exibem consulta ativa no dia de hoje com botão direto para a sala de teleconsulta.
- [x] O dia de amanhã também possui uma consulta agendada ativa para teste prévio.
- [x] Todos os testes unitários do Maven executam com sucesso (Green).

