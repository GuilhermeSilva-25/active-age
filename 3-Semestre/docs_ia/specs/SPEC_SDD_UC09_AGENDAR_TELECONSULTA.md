# 📋 ESPECIFICAÇÃO TÉCNICA (SPEC): AGENDAMENTO CONCORRENTE DE TELECONSULTA PELO PACIENTE

> **Código da Spec:** SPEC-10  
> **Projeto:** Active Age — Plataforma Integral de Telessaúde Geriátrica  
> **Módulo:** Agendamentos & Gestão de Consultas Virtuais  
> **Casos de Uso Relacionados:** UC09 (Agendar Teleconsulta: Paciente escolhe data/horário e confirma reserva) — Integração direta com UC08 (Busca de Médicos) e UC10 (Agenda Médica)  
> **Requisitos Funcionais / Regras de Negócio:** RF006, RF007, RN001 (Reserva Atômica sem Double-Booking), RN002 (Cancelamento Ético com Antecedência Mínima de 24 Horas)  
> **Normas de Referência Ética & Regulatória:** Resolução CFM nº 2.314/2022 (Diretrizes de Telemedicina), Código de Ética Médica (Pontualidade e Vedação à Desassistência), Lei Federal nº 13.709/2018 (LGPD - Sigilo de Agendamentos)  
> **Data:** 29 de Outubro de 2026  
> **Status:** CONCLUÍDA E HOMOLOGADA EM PRODUÇÃO ✅  
> **Metodologia:** Spec-Driven Development (SDD)

---

## 1. Contexto & Diagnóstico da Necessidade

No fluxo de telessaúde geriátrica, a etapa de agendamento de consultas representa um momento crítico tanto para a experiência do usuário idoso e de seu cuidador (IHC) quanto para a integridade concorrencial do sistema (Engenharia de Software):
1. **Acessibilidade & Clareza na Escolha do Horário:** O idoso necessita de uma visualização cristalina dos horários disponíveis, agrupados por data e dia da semana, com indicação explícita da duração (45-60 min) e dos honorários, sem pegadinhas de cobrança.
2. **Prevenção Concorrente de Double-Booking (RN001):** Dois pacientes não podem, sob nenhuma hipótese, reservar o mesmo horário do mesmo médico simultaneamente. A reserva deve ser **atômica e transacional**, com bloqueio imediato do slot na coleção `doctor_schedule_slots`.
3. **Cancelamento Ético e Reciclagem de Slots (RN002):** Em respeito à agenda do médico e à disponibilidade de vagas para outros idosos, o paciente pode cancelar consultas com antecedência de **mais de 24 horas**. Ao cancelar, o slot é devolvido para o status `LIVRE`, permitindo que outro paciente o reserve.

---

## 2. Conformidade Ético-Médica & Regulatória (CFM & LGPD)

1. **Atenção Exclusiva & Síncrona (Res. CFM nº 2.314/2022):**
   - O médico geriatra não pode realizar atendimentos simultâneos. Cada slot de horário é associado a um único paciente por vez.
2. **Direito de Desistência & Cancelamento Ético (RN002 / CFM):**
   - Cancelamento permitido via plataforma com antecedência **superior a 24 horas**.
   - Faltando menos de 24 horas, o cancelamento automático é bloqueado, exigindo contato direto para evitar abandono de horário reservado.
3. **Privacidade e Proteção de Dados (LGPD Art. 11):**
   - Os dados do agendamento (nome, sintomas prévios relatados e histórico de consultas) só podem ser visualizados pelo paciente titular e pelo médico agendado.

---

## 3. Modelagem de Dados & Arquitetura Backend

### 3.1. Enum de Situação da Consulta: `AppointmentStatus.java`

Local: `com.activeage.core.domain.enums.AppointmentStatus`

```java
package com.activeage.core.domain.enums;

public enum AppointmentStatus {
    AGENDADA,                   // Consulta confirmada aguardando data/horário
    REALIZADA,                  // Teleconsulta concluída pelo médico
    CANCELADA_PELO_PACIENTE,    // Cancelada pelo paciente com antecedência > 24h
    CANCELADA_PELO_MEDICO       // Cancelada por imprevisto do médico
}
```

---

### 3.2. Entidade e Coleção: `Appointment.java` (MongoDB Atlas)

Coleção: `appointments`

```java
package com.activeage.core.domain.models;

import com.activeage.core.domain.enums.AppointmentStatus;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "appointments")
public class Appointment {

    @Id
    private String id;

    @Indexed
    private String patientId;
    private String patientName;
    private String patientEmail;
    private String patientPhone;

    @Indexed
    private String doctorId;
    private String doctorName;
    private String doctorCrm;
    private String doctorUfCrm;
    private String doctorSpecialty;

    @Indexed
    private String slotId; // ID do slot reservado em doctor_schedule_slots

    private LocalDateTime startDateTime;
    private LocalDateTime endDateTime;
    private Integer durationMinutes;

    private BigDecimal consultationFee; // Honorário congelado no agendamento

    @Builder.Default
    private AppointmentStatus status = AppointmentStatus.AGENDADA;

    private String patientNotes; // Queixa principal ou sintomas prévios relatados
    private String cancellationReason; // Motivo quando cancelada

    private String meetRoomId; // Identificador da sala para o futuro microsserviço de WebRTC

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

---

### 3.3. DTOs de Entrada e Saída

#### DTO para Solicitação de Agendamento: `CreateAppointmentRequest.java`
```java
package com.activeage.core.dtos.requests;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateAppointmentRequest {

    @NotBlank(message = "O ID do horário (slot) é obrigatório.")
    private String slotId;

    private String patientNotes; // Opcional: queixa principal ou motivo da consulta
}
```

#### DTO de Resposta: `AppointmentResponse.java`
```java
package com.activeage.core.dtos.responses;

import com.activeage.core.domain.enums.AppointmentStatus;
import lombok.Data;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class AppointmentResponse {
    private String id;
    private String patientId;
    private String patientName;
    private String doctorId;
    private String doctorName;
    private String doctorCrm;
    private String doctorUfCrm;
    private String doctorSpecialty;
    private String slotId;
    private LocalDateTime startDateTime;
    private LocalDateTime endDateTime;
    private Integer durationMinutes;
    private BigDecimal consultationFee;
    private AppointmentStatus status;
    private String patientNotes;
    private String meetRoomId;
    private boolean canCancel; // True se faltam mais de 24h para a consulta (RN002)
    private LocalDateTime createdAt;
}
```

---

### 3.4. Repositório: `AppointmentRepository.java`

```java
package com.activeage.core.repositories;

import com.activeage.core.domain.models.Appointment;
import com.activeage.core.domain.enums.AppointmentStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends MongoRepository<Appointment, String> {

    // Lista consultas do paciente ordenadas por data
    List<Appointment> findByPatientIdOrderByStartDateTimeDesc(String patientId);

    // Lista consultas ativas futuras do paciente
    List<Appointment> findByPatientIdAndStatusAndStartDateTimeGreaterThanEqualOrderByStartDateTimeAsc(
        String patientId, AppointmentStatus status, LocalDateTime from
    );

    // Lista consultas do médico
    List<Appointment> findByDoctorIdOrderByStartDateTimeAsc(String doctorId);

    // Lista consultas do dia do médico (para dashboard do médico)
    List<Appointment> findByDoctorIdAndStatusAndStartDateTimeBetweenOrderByStartDateTimeAsc(
        String doctorId, AppointmentStatus status, LocalDateTime startOfDay, LocalDateTime endOfDay
    );
}
```

---

### 3.5. Camada de Serviço: `AppointmentService.java`

#### Regras de Negócio e Atomicidade:
1. **Reserva Atômica e Bloqueio de Double-Booking (RN001):**
   - O paciente autenticado submete `CreateAppointmentRequest` com `slotId`.
   - Busca o slot em `DoctorScheduleSlotRepository`.
   - Valida:
     - Se o slot existe;
     - Se o slot está no futuro (`startDateTime.isAfter(LocalDateTime.now())`);
     - Se `slot.getStatus() == SlotStatus.LIVRE`. Caso contrário, lança `IllegalStateException("Este horário não está mais disponível para agendamento. Por favor, escolha outro horário.")`.
   - Busca os dados cadastrais do médico (`User`) para congelar o nome, CRM/UF e honorários (`consultationFee`).
   - Cria o registro na coleção `appointments` com status `AGENDADA`.
   - Atualiza o slot para `status = OCUPADO`, `patientId = patient.getId()`, `patientName = patient.getFullName()`, `appointmentId = appointment.getId()`.
2. **Cancelamento Ético com Antecedência de 24h (RN002):**
   - Valida se o agendamento pertence ao paciente logado.
   - Valida antecedência: `appointment.getStartDateTime().isAfter(LocalDateTime.now().plusHours(24))`. Se faltarem menos de 24 horas, lança `IllegalStateException("Consultas com menos de 24 horas de antecedência não podem ser canceladas pela plataforma.")`.
   - Atualiza `appointment.setStatus(AppointmentStatus.CANCELADA_PELO_PACIENTE)`.
   - **Devolução do Slot (Reciclagem):** Atualiza o slot correspondente em `doctor_schedule_slots` de volta para `SlotStatus.LIVRE`, limpando `patientId`, `patientName` e `appointmentId`.
3. **Listagem das Próximas Consultas:**
   - Endpoint para o paciente ver seus agendamentos com indicador `canCancel`.
   - Endpoint para o médico visualizar os pacientes agendados do dia.

---

## 4. Endpoints da API RESTful (`AppointmentController.java`)

| Método | Endpoint | Permissão | Descrição |
|---|---|---|---|
| `POST` | `/api/patient/appointments` | `ROLE_PACIENTE` | Agenda uma nova consulta reservando o slot de forma atômica (RN001) |
| `GET` | `/api/patient/appointments` | `ROLE_PACIENTE` | Lista todos os agendamentos do paciente autenticado (próximos e passados) |
| `GET` | `/api/patient/appointments/next` | `ROLE_PACIENTE` | Retorna a próxima consulta agendada mais iminente para o dashboard |
| `PATCH` | `/api/patient/appointments/{id}/cancel` | `ROLE_PACIENTE` | Cancela consulta respeitando a antecedência mínima de 24h (RN002) |
| `GET` | `/api/doctor/appointments/today` | `ROLE_MEDICO` | Retorna lista de pacientes agendados para o dia de hoje no painel do médico |

---

## 5. Arquitetura Frontend & Experiência do Usuário (IHC / WCAG)

### 5.1. Modal de Agendamento na Vitrine (`AgendarConsultaModal.tsx`):
- Ao clicar em "Ver Horários & Agendar" no card ou modal do médico em `/paciente/busca-medicos`:
  - Abre o modal com os dados do médico no topo (foto, nome, CRM/UF, valor da consulta).
  - Consome `GET /api/doctors/{id}/availability`.
  - Agrupa os slots livres por data (ex: *"Quinta-feira, 05 de Novembro"*).
  - O idoso clica no botão do horário desejado (ex: *"09:00"*), que ganha destaque visual laranja.
  - Campo opcional de texto acessível para sintomas ou motivo da consulta.
  - Botão destacado com spinner: **"Confirmar Agendamento"**.
  - Após sucesso, exibe `FeedbackModal` e oferece atalho para "Ver Minhas Consultas".

### 5.2. Página de Consultas do Paciente (`MinhasConsultas.tsx` em `/paciente/consultas`):
- Cards ampliados para leitura fácil por idosos e cuidadores:
  - Data e horário com ícone `Calendar` e `Clock`.
  - Nome do médico geriatra, CRM, valor e duração (50 min).
  - Status em badge: 🟢 Confirmada / ⚪ Realizada / 🔴 Cancelada.
  - Botão **"Cancelar Consulta"** (habilitado apenas se faltarem mais de 24 horas, com aviso claro de antecedência).
  - Modal acessível de confirmação de cancelamento (`FeedbackModal` com spinner e backdrop suave).

### 5.3. Integração com Dashboards:
- **`DashboardPaciente.tsx`:**
  - Card 2 ("Minhas Consultas & Horários") agora navega para `/paciente/consultas`.
  - A seção "Próxima Consulta Agendada" passa a exibir o card real da consulta se houver agendamento ativo.
- **`DashboardMedico.tsx`:**
  - A seção "Pacientes Agendados no Dia" consome `GET /api/doctor/appointments/today` e lista os atendimentos reais com nome e horário.

---

## 6. Critérios de Aceite em Formato BDD (Gherkin)

```gherkin
Funcionalidade: Agendamento Concorrente de Teleconsulta pelo Paciente (UC09)
  Como um paciente idoso ou cuidador cadastrado
  Eu quero escolher um horário livre na vitrine do médico e confirmar o agendamento
  Para garantir meu atendimento especializado sem risco de marcação dupla

  Cenário 1: Paciente agenda consulta com sucesso em slot livre (Caminho Feliz / RN001)
    Dado que o médico "Dr. Alan Turing" possui um slot "LIVRE" em "06/11/2026 às 10:00"
    E o paciente "Antônio Carlos da Silva" está autenticado com perfil "ROLE_PACIENTE"
    Quando o paciente submete o agendamento para este slot com motivo "Ajuste de medicamentos"
    Então o sistema cria o registro na coleção "appointments" com status "AGENDADA"
    E o slot do médico é alterado para status "OCUPADO" vinculado ao ID do paciente
    E a consulta passa a aparecer na lista de compromissos do paciente.

  Cenário 2: Tentativa de agendar em slot que acabou de ser ocupado (Caminho Triste / Double-Booking)
    Dado que outro paciente reservou o mesmo slot uma fração de segundo antes
    Quando o paciente tenta confirmar o agendamento
    Então o backend rejeita a operação com status HTTP 400 Bad Request
    E exibe a mensagem: "Este horário não está mais disponível para agendamento. Por favor, escolha outro horário."
    E nenhum agendamento duplicado é gravado.

  Cenário 3: Cancelamento de consulta com mais de 24 horas de antecedência (Caminho Feliz / RN002)
    Dado que o paciente possui uma consulta agendada para daqui a 3 dias (mais de 24h)
    Quando o paciente clica em "Cancelar Consulta" e confirma no modal
    Então o status da consulta é atualizado para "CANCELADA_PELO_PACIENTE"
    E o slot correspondente na agenda do médico volta a ficar com status "LIVRE"
    E outro paciente pode visualizar e agendar esse horário na vitrine.

  Cenário 4: Tentativa de cancelamento com menos de 24 horas de antecedência (Caminho Triste / RN002)
    Dado que a consulta do paciente está marcada para daqui a 4 horas (menos de 24h)
    Quando o paciente tenta cancelar a consulta pelo portal
    Então o sistema bloqueia a ação informando que consultas com menos de 24h não podem ser desmarcadas pelo sistema
    E o agendamento permanece ativo.
```

---

## 7. Plano de Execução & Micro Tarefas

1. **Micro Tarefa 10.1 (Backend Domain & Repositories):**
   - Criar enum `AppointmentStatus.java`;
   - Criar model `Appointment.java` no MongoDB Atlas;
   - Criar repositório `AppointmentRepository.java`.
2. **Micro Tarefa 10.2 (Backend DTOs, Service & Controller):**
   - Criar `CreateAppointmentRequest.java` e `AppointmentResponse.java`;
   - Implementar `AppointmentService.java` com reserva atômica (RN001), reciclagem de slot no cancelamento (RN002) e trava de 24h;
   - Implementar `AppointmentController.java` (`/api/patient/appointments` e `/api/doctor/appointments`);
   - Testes unitários em `AppointmentServiceTest.java`.
3. **Micro Tarefa 10.3 (Frontend Modal de Agendamento):**
   - Criar `AgendarConsultaModal.tsx` na vitrine de médicos;
   - Conectar o botão "Ver Horários & Agendar" de `BuscaMedicos.tsx` e `DoctorDetailModal.tsx` para abrir o modal de horários reais.
4. **Micro Tarefa 10.4 (Frontend Minhas Consultas & Dashboards):**
   - Criar tela `MinhasConsultas.tsx` (`/paciente/consultas`) com cancelamento e regras de 24h;
   - Atualizar `DashboardPaciente.tsx` (Card 2 e próxima consulta dinâmica);
   - Atualizar `DashboardMedico.tsx` para listar consultas reais do dia;
   - Registrar rotas no `App.tsx`.
5. **Micro Tarefa 10.5 (Homologação, Testes, Commit e Push):**
   - Compilação do Maven e Vite;
   - Atualização do roteiro BDD e plano de release;
   - Git Commit e Push na branch `main`.
