# 📋 ESPECIFICAÇÃO TÉCNICA (SPEC): MÉDICO TESTE, AUTOMAÇÃO DE AGENDA BI-DIÁRIA E EXPANSÃO DO CATÁLOGO DE MÉDICOS HOMENAGEADOS

> **Código da Spec:** SPEC-11B  
> **Projeto:** Active Age — Plataforma Integral de Telessaúde Geriátrica  
> **Módulo:** Semeador de Dados & Automação de Agendas para Apresentação  
> **Casos de Uso Relacionados:** UC01 (Cadastro), UC08 (Vitrine de Médicos), UC09 (Agendamento de Teleconsultas), UC10 (Agenda Médica)  
> **Data:** 29 de Outubro de 2026  
> **Status:** CONCLUÍDA E HOMOLOGADA ✅  
> **Metodologia:** Spec-Driven Development (SDD)

---

## 1. Contexto & Diagnóstico da Necessidade

Para a apresentação do sistema Active Age e demonstrações de fluxo completo de teleconsulta geriátrica:
1. **Credencial de Acesso Fácil para Testes Imediatos:** Criação de um médico padrão homologado com credenciais universais e memoráveis:
   - **E-mail:** `medico@teste.com`
   - **Senha:** `123456`
   - **Perfil:** Status `APPROVED`, CRM/RQE ativos, dados bancários de split direto configurados e foto profissional de alta resolução.
2. **Disponibilidade Permanente de Horários Livres sem Acúmulo Infinito:**
   - O médico de teste deve ter horários de atendimento livres **todos os dias**.
   - Para não sobrecarregar o MongoDB Atlas com agendamentos infinitos no futuro, implementaremos uma **automação controlada no Spring Boot** que gera slots para **o dia atual (`LocalDate.now()`) e o próximo dia (`LocalDate.now().plusDays(1)`)**.
   - Essa rotina é disparada **imediatamente na inicialização da aplicação** e mantida ativa por um agendador (`@Scheduled`) de **2 em 2 dias**.
3. **Expansão da Vitrine de Médicos para Demonstração:**
   - Adição de mais 12 grandes pioneiros da tecnologia e da ciência ao catálogo de médicos geriatras do `DataInitializer.java` (totalizando 17 médicos homologados).
   - Esses médicos extras **não terão consultas agendadas**, compondo uma vitrine diversificada com múltiplos Estados da Federação (SP, RJ, MG, RS, PR, BA, SC, DF, PE, CE, GO), faixas de preço e focos clínicos geriátricos para enriquecer os filtros de busca.

---

## 2. Modelagem & Arquitetura Técnica

### 2.1. Habilitação de Agendamento Assíncrono no Spring Boot: `ActiveAgeCoreApplication.java`
- Inclusão da anotação `@EnableScheduling` na classe raiz para habilitar tarefas cron no container Spring.

### 2.2. Serviço de Automação de Grade Médica: `DoctorScheduleAutomationService.java`
Local: `com.activeage.core.services.DoctorScheduleAutomationService`

**Responsabilidades:**
1. `ensureTestDoctorSchedule()`:
   - Localiza o médico com e-mail `medico@teste.com`.
   - Itera pelos dias: `D0 = LocalDate.now()` e `D1 = LocalDate.now().plusDays(1)`.
   - Gera horários nos seguintes turnos de 50 minutos (com pausas técnicas de 10 min):
     - Manhã: `09:00`, `10:00`, `11:00`
     - Tarde: `14:00`, `15:00`, `16:00`, `17:00`
   - Para cada horário, verifica se o slot já existe via `doctorScheduleSlotRepository.existsByDoctorIdAndStartDateTime(doctorId, startDateTime)`.
   - Se não existir, persiste com `status = LIVRE`, `durationMinutes = 50` e `notes = "Atendimento Clínico Geriátrico"`.
2. `purgeExpiredFreeSlots()`:
   - Higieniza slots com status `LIVRE` cuja data de atendimento seja anterior a ontem, mantendo o banco limpo e performático.
3. Agendamento com `@Scheduled`:
   - `@Scheduled(cron = "0 0 1 */2 * *")`: Executa a cada 2 dias à 01:00 da manhã.

---

### 2.3. Atualização do `DataInitializer.java`

1. **Injeção:** Recebe `DoctorScheduleAutomationService` no construtor.
2. **Método `seedTestDoctor()`:**
   - Garante a existência do usuário `medico@teste.com` com senha `123456` (BCrypt).
   - Se já existir, atualiza a senha para `123456` para garantir que esteja sempre acessível.
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

* **Cenário 1: Login do Médico Teste**
  - **Dado** que o backend inicializou
  - **Quando** o usuário faz login com `medico@teste.com` e senha `123456`
  - **Então** a autenticação é bem-sucedida e redireciona para `/medico/dashboard`.

* **Cenário 2: Disponibilidade Imediata de Horários na Vitrine**
  - **Dado** que um paciente acessa a vitrine de busca e clica em agendar com o "Dr. Médico Teste"
  - **Então** visualiza os horários livres para o dia de hoje e para o dia de amanhã.

* **Cenário 3: Automação Bi-Diária sem Duplicação**
  - **Dado** que a rotina agendada roda a cada 2 dias
  - **Quando** verifica os slots de hoje e amanhã
  - **Então** adiciona apenas os horários faltantes, respeitando o índice único anti-duplicação.

* **Cenário 4: Apresentação com Vitrine Enriquecida**
  - **Dado** que o paciente filtra por diferentes Estados (ex: RJ, MG, RS, BA)
  - **Então** encontra médicos especialistas correspondentes para ilustrar a abrangência nacional da telemedicina.
