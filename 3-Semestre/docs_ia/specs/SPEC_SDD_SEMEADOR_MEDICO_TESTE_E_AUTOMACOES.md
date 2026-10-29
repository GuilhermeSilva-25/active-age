# 📋 ESPECIFICAÇÃO TÉCNICA (SPEC): MÉDICO TESTE, PACIENTE TESTE, AUTOMAÇÃO DE TELECONSULTA DIÁRIA E EXPANSÃO DO CATÁLOGO DE MÉDICOS HOMENAGEADOS

> **Código da Spec:** SPEC-11B  
> **Projeto:** Active Age — Plataforma Integral de Telessaúde Geriátrica  
> **Módulo:** Semeador de Dados & Automação de Agendas e Teleconsultas para Demonstração  
> **Casos de Uso Relacionados:** UC01 (Cadastro), UC08 (Vitrine de Médicos), UC09 (Agendamento de Teleconsultas), UC10 (Agenda Médica), UC12 (Cockpit Teleconsulta)  
> **Requisitos Funcionais / Regras de Negócio:** RF006, RF007, RF008, RF009, RN001, RN003, RN008  
> **Normas de Referência Ética & Regulatória:** Resolução CFM nº 2.314/2022, Resolução CFM nº 2.336/2023  
> **Data:** 29 de Outubro de 2026  
> **Status:** CONCLUÍDA E HOMOLOGADA EM PRODUÇÃO ✅  
> **Metodologia:** Spec-Driven Development (SDD)

---

## 1. Contexto & Diagnóstico da Necessidade

Para a apresentação do sistema Active Age e demonstrações de fluxo completo de teleconsulta geriátrica:
1. **Credenciais de Acesso Fácil para Testes Imediatos (Bilateral):**
   - **Médico Teste:**
     - **E-mail:** `medico@teste.com`
     - **Senha:** `123456`
     - **Perfil:** Dr. Marcos Silveira, status `APPROVED`, CRM/RQE ativos, dados bancários de split direto configurados e foto profissional de alta resolução.
   - **Paciente Teste:**
     - **E-mail:** `paciente@teste.com`
     - **Senha:** `123456`
     - **Perfil:** Dona Maria de Lourdes Silva, 78 anos, CPF regular, cadastro completo para simulação de consultas e visualização de documentos.
2. **Disponibilidade Permanente de Horários Livres sem Acúmulo Infinito:**
   - O médico de teste deve ter horários de atendimento livres **todos os dias**.
   - Para não sobrecarregar o MongoDB Atlas com agendamentos infinitos no futuro, implementamos uma **automação controlada no Spring Boot** que gera slots para **o dia atual (`LocalDate.now()`) e o próximo dia (`LocalDate.now().plusDays(1)`)**.
   - Higieniza slots livres passados (`purgeExpiredFreeSlots`).
3. **Garantia de Teleconsulta Ativa no Dia Atual (Cockpit de Atendimento):**
   - Para que o avaliador ou usuário possa testar a sala virtual (`/teleconsulta/:appointmentId`) a qualquer momento sem precisar agendar manualmente antes:
   - A automação verifica se o `medico@teste.com` já possui consulta com status `AGENDADA` no dia atual (`LocalDate.now()`).
   - Caso não possua, reserva automaticamente um slot de hoje e cria um `Appointment` confirmado vinculado à paciente de teste `paciente@teste.com`.
   - Adicionalmente, semeia 2 exames prévios (Hemograma Completo e Eletrocardiograma de Repouso) no cofre digital MongoDB GridFS da paciente para que o médico possa consultar os laudos dentro do cockpit de chamada virtual.
4. **Frequência da Automação:**
   - Disparada imediatamente no bootstrap da aplicação (`DataInitializer.java`).
   - Mantida ativa por um agendador (`@Scheduled(cron = "0 0 * * * *")`) executado de **hora em hora**, garantindo sincronismo permanente mesmo em viradas de dia.
5. **Expansão da Vitrine de Médicos para Demonstração:**
   - Adição de mais 12 grandes pioneiros da tecnologia e da ciência ao catálogo de médicos geriatras do `DataInitializer.java` (totalizando 17 médicos homologados).
   - Esses médicos extras **não terão consultas agendadas**, compondo uma vitrine diversificada com múltiplos Estados da Federação (SP, RJ, MG, RS, PR, BA, SC, DF, PE, CE, GO), faixas de preço e focos clínicos geriátricos para enriquecer os filtros de busca.

---

## 2. Modelagem & Arquitetura Técnica

### 2.1. Habilitação de Agendamento Assíncrono no Spring Boot: `ActiveAgeCoreApplication.java`
- Inclusão da anotação `@EnableScheduling` na classe raiz para habilitar tarefas cron no container Spring.

### 2.2. Serviço de Automação de Grade Médica: `DoctorScheduleAutomationService.java`
Local: `com.activeage.core.services.DoctorScheduleAutomationService`

**Responsabilidades:**
1. `ensureTestPatient()`:
   - Assegura a existência do paciente padrão `paciente@teste.com` com senha `123456` e perfil `ROLE_PACIENTE`.
2. `ensureTestPatientExams(testPatient)`:
   - Armazena PDFs sintéticos válidos no MongoDB GridFS e vincula metadados na coleção `PatientExam` (Laboratorial e Cardiológico).
3. `ensureTestDoctorSchedule()`:
   - Localiza o médico com e-mail `medico@teste.com`.
   - Itera pelos dias: `D0 = LocalDate.now()` e `D1 = LocalDate.now().plusDays(1)`.
   - Gera horários nos seguintes turnos de 50 minutos (com pausas técnicas de 10 min):
     - Manhã: `09:00`, `10:00`, `11:00`
     - Tarde: `14:00`, `15:00`, `16:00`, `17:00`
   - Se o slot não existir, persiste com `status = LIVRE`, `durationMinutes = 50`.
4. `ensureTodayActiveAppointment(doctor, patient)`:
   - Busca consultas `AGENDADA` entre `startOfDay` e `endOfDay` de hoje.
   - Se nenhuma existir, cria/reserva um slot de hoje e persiste um `Appointment` confirmado com anotações geriátricas prévias e ID de sala virtual.
5. `purgeExpiredFreeSlots(doctorId)`:
   - Higieniza slots com status `LIVRE` anteriores ao início do dia atual.
6. Agendamento com `@Scheduled`:
   - `@Scheduled(cron = "0 0 * * * *")`: Executa a cada hora cheia.

---

### 2.3. Atualização do `DataInitializer.java`

1. **Injeção:** Recebe `DoctorScheduleAutomationService` no construtor.
2. **Método `seedTestDoctor()`:**
   - Garante a existência do usuário `medico@teste.com` com senha `123456` (BCrypt).
   - Invoca imediatamente `doctorScheduleAutomationService.ensureTestDoctorSchedule()`.
3. **Método `seedPioneerDoctors()` Ampliado:**
   - Mantém os 5 já existentes (Ada Lovelace, Alan Turing, Grace Hopper, Margaret Hamilton, Tim Berners-Lee).
   - Adiciona 12 novos médicos homenageados:
     1. **Dr. Dennis Ritchie** (CRM 197206/SP) — Foco: AGA, Saúde Cardiovascular
     2. **Dr. Claude Shannon** (CRM 194807/RJ) — Foco: Memória e Demências, Reabilitação Cognitiva
     3. **Dra. Katherine Johnson** (CRM 196108/MG) — Foco: Longevidade Ativa, Osteoporose
     4. **Dr. John von Neumann** (CRM 194509/SP) — Foco: Polifarmácia, Cuidados Paliativos
     5. **Dra. Barbara Liskov** (CRM 197410/RS) — Foco: Memória e Demências, Nutrição do Idoso
     6. **Dr. Donald Knuth** (CRM 196811/PR) — Foco: AGA, Prevenção de Quedas
     7. **Dra. Hedy Lamarr** (CRM 194212/BA) — Foco: Longevidade Ativa, Saúde Cardiovascular
     8. **Dr. Linus Torvalds** (CRM 199113/SC) — Foco: Polifarmácia, AGA
     9. **Dra. Radia Perlman** (CRM 198514/DF) — Foco: Cuidados Paliativos, Memória
     10. **Dr. Leslie Lamport** (CRM 197815/PE) — Foco: Saúde Cardiovascular, Quedas
     11. **Dra. Frances Allen** (CRM 197116/CE) — Foco: AGA, Memória, Longevidade
     12. **Dr. Edgar Codd** (CRM 197017/GO) — Foco: Polifarmácia, Osteoporose

---

## 3. Critérios de Aceite & Validação (BDD)

* **Cenário 1: Login do Médico Teste e Visualização da Consulta do Dia**
  - **Dado** que o backend inicializou
  - **Quando** o usuário faz login com `medico@teste.com` e senha `123456`
  - **Então** a autenticação é bem-sucedida e no painel `/medico/dashboard` visualiza Dona Maria de Lourdes na tabela de hoje com o botão "Abrir Sala Virtual →".

* **Cenário 2: Login da Paciente Teste e Acesso à Sala Virtual**
  - **Dado** que o usuário faz login com `paciente@teste.com` e senha `123456`
  - **Então** visualiza no dashboard `/paciente/dashboard` o card de Próxima Consulta com Dr. Marcos Silveira e o botão "Entrar na Sala Virtual".

* **Cenário 3: Exames Prévios Visíveis no Cockpit de Teleconsulta**
  - **Dado** que o médico entra na sala `/teleconsulta/:appointmentId`
  - **Quando** clica na aba "Exames do Paciente"
  - **Então** visualiza o Hemograma Completo e o ECG anexados no GridFS com opção de abrir ou visualizar o laudo.

* **Cenário 4: Disponibilidade Imediata de Novos Horários na Vitrine**
  - **Dado** que um paciente acessa a vitrine de busca e clica em agendar com o "Dr. Médico Teste"
  - **Então** visualiza os horários livres para o dia de hoje e para o dia de amanhã.

* **Cenário 5: Apresentação com Vitrine Enriquecida**
  - **Dado** que o paciente filtra por diferentes Estados (ex: RJ, MG, RS, BA)
  - **Então** encontra médicos especialistas correspondentes para ilustrar a abrangência nacional da telemedicina.
