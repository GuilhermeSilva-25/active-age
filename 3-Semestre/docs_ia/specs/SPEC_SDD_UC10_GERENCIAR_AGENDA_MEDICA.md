# 📋 ESPECIFICAÇÃO TÉCNICA (SPEC): GESTÃO DE AGENDA MÉDICA & GRADE DE DISPONIBILIDADE

> **Código da Spec:** SPEC-09  
> **Projeto:** Active Age — Plataforma Integral de Telessaúde Geriátrica  
> **Módulo:** Consultório Virtual & Gestão de Disponibilidade Médica  
> **Casos de Uso Relacionados:** UC10 (Gerenciar Agenda: Visualização, criação, bloqueio e cancelamento de slots) — Base mandatória para UC09 (Agendar Teleconsulta pelo Paciente)  
> **Requisitos Funcionais / Regras de Negócio:** RF006, RF007, RN001, RN002, RN008  
> **Normas de Referência Ética & Regulatória:** Resolução CFM nº 2.314/2022 (Diretrizes de Telemedicina), Código de Ética Médica (Resolução CFM nº 2.217/2018 - Pontualidade e Zelo no Atendimento), Lei Federal nº 13.709/2018 (LGPD)  
> **Data:** 29 de Outubro de 2026  
> **Status:** CONCLUÍDA E HOMOLOGADA EM PRODUÇÃO ✅  
> **Metodologia:** Spec-Driven Development (SDD)

---

## 1. Contexto & Diagnóstico da Necessidade

No modelo de telessaúde geriátrica, a gestão de tempo do médico exige particularidades clínicas essenciais:
1. **Consultas Mais Longas e Humanizadas:** Diferente de especialidades convencionais onde atendimentos duram 15 a 20 minutos, a consulta geriátrica de primeira vez ou acompanhamento complexo exige habitualmente de **45 a 60 minutos** (recomendação da SBGG - Sociedade Brasileira de Geriatria e Gerontologia) para avaliação de polifarmácia, quedas e histórico familiar com o cuidador.
2. **Intervalo Técnico entre Consultas:** O médico necessita de pausas técnicas (ex: 10 a 15 minutos) para finalização de anotações no prontuário, emissão de prescrições e higienização cognitiva antes do próximo atendimento virtual.
3. **Bloqueio Ético de Credenciamento (RN008):** Nenhum profissional pode disponibilizar horários ou atender pacientes caso seu Dossiê Ético-Profissional não esteja **Aprovado e Homologado (`dossierStatus == APPROVED`)** perante as resoluções do CFM.

O **UC10 (Gerenciar Agenda)** é o pilar que capacita o médico geriatra a estruturar seus turnos de atendimento, configurar sua grade de horários livres de forma flexível (avulsa ou em lote automatizado) e controlar bloqueios para folgas e intervalos, fornecendo o alicerce para que o paciente possa agendar sua teleconsulta no **UC09**.

---

## 2. Conformidade Ético-Médica & Regulatória (CFM & LGPD)

1. **Vedação ao Overbooking / Atendimento Concomitante (Res. CFM nº 2.314/2022):**
   - É terminantemente proibido o agendamento duplo (*double-booking*) no mesmo intervalo de tempo. O médico deve garantir atenção exclusiva e síncrona a cada paciente idoso.
   - O banco de dados NoSQL deve impor **índice composto único** garantindo que um mesmo médico não possa possuir múltiplos slots sobrepostos.
2. **Exigência de Dossiê Homologado (RN008):**
   - Médicos com status `PENDING_DOCS`, `UNDER_REVIEW` ou `DOCS_REJECTED` têm a abertura de horários bloqueada pelo backend com HTTP 403 e feedback educativo no frontend.
3. **Regra de Cancelamento e Estabilidade de Agenda (RN002 / CFM):**
   - Slots com status `LIVRE` ou `BLOQUEADO` podem ser excluídos ou alterados pelo médico a qualquer momento.
   - Slots com status `OCUPADO` (consulta já reservada por paciente) **não podem ser excluídos sumariamente** pelo médico pelo CRUD de slots; qualquer desmarcação exige fluxo formal de cancelamento justificado com aviso e estorno ao paciente (regra tratada no UC09/UC10).

---

## 3. Modelagem de Dados & Arquitetura Backend

### 3.1. Enum de Situação do Slot: `SlotStatus.java`

Local: `com.activeage.core.domain.enums.SlotStatus`

```java
package com.activeage.core.domain.enums;

public enum SlotStatus {
    LIVRE,      // Horário disponível para reserva por qualquer paciente na vitrine
    OCUPADO,    // Reservado/agendado por um paciente para consulta
    BLOQUEADO   // Pausa, almoço, reunião ou indisponibilidade temporária definida pelo médico
}
```

---

### 3.2. Entidade e Coleção: `DoctorScheduleSlot.java` (MongoDB Atlas)

Coleção: `doctor_schedule_slots`

```java
package com.activeage.core.domain.models;

import com.activeage.core.domain.enums.SlotStatus;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "doctor_schedule_slots")
@CompoundIndex(name = "doctor_start_time_unique_idx", def = "{'doctorId': 1, 'startDateTime': 1}", unique = true)
public class DoctorScheduleSlot {

    @Id
    private String id;

    private String doctorId; // ID do médico (User com ROLE_MEDICO)

    private LocalDateTime startDateTime; // Início da consulta (ex: 2026-11-05T09:00:00)
    private LocalDateTime endDateTime;   // Término da consulta (ex: 2026-11-05T09:50:00)

    private Integer durationMinutes;    // Duração em minutos (padrão: 50 minutos)

    @Builder.Default
    private SlotStatus status = SlotStatus.LIVRE;

    private String appointmentId; // ID do agendamento vinculado quando ocupado (UC09)
    private String patientId;     // ID do paciente vinculado quando ocupado (UC09)
    private String patientName;   // Cache do nome do paciente para exibição rápida

    private String notes;         // Observações internas do médico (ex: "Turno da Manhã")

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

---

### 3.3. DTOs de Entrada e Saída

#### DTO para Criação de Slot Avulso: `CreateSlotRequest.java`
```java
package com.activeage.core.dtos.requests;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CreateSlotRequest {
    @NotNull(message = "A data e hora de início são obrigatórias.")
    @Future(message = "O horário deve ser agendado para uma data futura.")
    private LocalDateTime startDateTime;

    private Integer durationMinutes; // Opcional: default 50 minutos se omitido
    private String notes;
}
```

#### DTO para Geração de Grade em Lote: `CreateBatchSlotsRequest.java`
```java
package com.activeage.core.dtos.requests;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class CreateBatchSlotsRequest {
    @NotNull(message = "A data de atendimento é obrigatória.")
    @FutureOrPresent(message = "A data deve ser hoje ou uma data futura.")
    private LocalDate date;

    @NotNull(message = "O horário de início do turno é obrigatório.")
    private LocalTime startTime; // Ex: 08:00

    @NotNull(message = "O horário de encerramento do turno é obrigatório.")
    private LocalTime endTime;   // Ex: 12:00

    private Integer durationMinutes = 50; // Padrão geriátrico 50 minutos
    private Integer breakMinutes = 10;    // Pausa técnica de 10 minutos entre consultas
    private String notes;
}
```

#### DTO de Resposta: `DoctorScheduleSlotResponse.java`
```java
package com.activeage.core.dtos.responses;

import com.activeage.core.domain.enums.SlotStatus;
import lombok.Data;
import lombok.Builder;

import java.time.LocalDateTime;

@Data
@Builder
public class DoctorScheduleSlotResponse {
    private String id;
    private String doctorId;
    private LocalDateTime startDateTime;
    private LocalDateTime endDateTime;
    private Integer durationMinutes;
    private SlotStatus status;
    private String appointmentId;
    private String patientName;
    private String notes;
}
```

---

### 3.4. Repositório: `DoctorScheduleSlotRepository.java`

```java
package com.activeage.core.repositories;

import com.activeage.core.domain.models.DoctorScheduleSlot;
import com.activeage.core.domain.enums.SlotStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DoctorScheduleSlotRepository extends MongoRepository<DoctorScheduleSlot, String> {
    
    // Lista todos os slots do médico em uma janela de datas (ex: mês ou semana)
    List<DoctorScheduleSlot> findByDoctorIdAndStartDateTimeBetweenOrderByStartDateTimeAsc(
        String doctorId, LocalDateTime start, LocalDateTime end
    );

    // Lista todos os slots futuros do médico
    List<DoctorScheduleSlot> findByDoctorIdAndStartDateTimeGreaterThanEqualOrderByStartDateTimeAsc(
        String doctorId, LocalDateTime from
    );

    // Vitrine do Paciente (UC08/UC09): busca apenas horários LIVRES e futuros de um médico
    List<DoctorScheduleSlot> findByDoctorIdAndStatusAndStartDateTimeGreaterThanEqualOrderByStartDateTimeAsc(
        String doctorId, SlotStatus status, LocalDateTime from
    );

    // Validação de colisão de horário antes de inserir
    boolean existsByDoctorIdAndStartDateTime(String doctorId, LocalDateTime startDateTime);
}
```

---

### 3.5. Camada de Serviço: `DoctorScheduleService.java`

Regras de Negócio Implementadas na Camada de Serviço:
1. **Validação de Dossiê (`RN008`):** Verifica se o médico possui `dossierStatus == APPROVED`. Se não possuir, lança `SecurityException` ("Seu consultório virtual só pode ser ativado após a homologação do Dossiê pelo CFM").
2. **Validação de Colisão / Conflito:** Antes de gravar qualquer slot (avulso ou em lote), verifica se já existe slot naquele horário. Na geração em lote, slots conflitantes são ignorados graciosamente, reportando quantos slots novos foram gerados.
3. **Cálculo Preciso da Grade de Turno:**
   - Loop a partir de `startTime` somando `durationMinutes + breakMinutes` enquanto o término estimado (`currentStart + durationMinutes`) for menor ou igual a `endTime`.
4. **Proteção contra Exclusão de Consulta Agendada:**
   - Se o slot estiver com status `OCUPADO`, impede a exclusão via `DELETE` lançando `IllegalStateException` ("Horários com consultas agendadas não podem ser excluídos diretamente. Utilize a opção de cancelamento de consulta.").
5. **Alternância de Bloqueio (`toggleBlock`):**
   - Transita entre `LIVRE` e `BLOQUEADO` (apenas para slots não ocupados).

---

## 4. Endpoints da API RESTful (`DoctorScheduleController.java`)

| Método | Endpoint | Permissão | Descrição |
|---|---|---|---|
| `GET` | `/api/doctor/schedule` | `ROLE_MEDICO` | Lista slots do médico autenticado por janela de datas (`?startDate=...&endDate=...`) |
| `POST` | `/api/doctor/schedule/slot` | `ROLE_MEDICO` | Cadastra um horário avulso de consulta |
| `POST` | `/api/doctor/schedule/batch` | `ROLE_MEDICO` | Gera múltiplos horários em lote para um turno de trabalho |
| `DELETE` | `/api/doctor/schedule/slot/{id}` | `ROLE_MEDICO` | Remove um slot (permitido apenas se `LIVRE` ou `BLOQUEADO`) |
| `PATCH` | `/api/doctor/schedule/slot/{id}/toggle-block` | `ROLE_MEDICO` | Alterna o status do slot entre `LIVRE` e `BLOQUEADO` |
| `GET` | `/api/doctor/schedule/summary` | `ROLE_MEDICO` | Retorna métricas da agenda (total livres, total agendados, taxa de ocupação) |
| `GET` | `/api/doctors/{id}/availability` | Pública / Autenticada | Retorna slots `LIVRE` e futuros para agendamento pelo paciente |

---

## 5. Arquitetura Frontend & Experiência do Usuário (IHC / WCAG)

### 5.1. Rota & Acesso
- Rota protegida: `/medico/agenda` sob `ProtectedRoute.tsx` (exige `ROLE_MEDICO`).
- Ponto de entrada: Card **"Minha Agenda"** no `DashboardMedico.tsx` com link direto.

### 5.2. Componentes da Interface (`MinhaAgenda.tsx` & `GerarHorariosModal.tsx`)
1. **Cabeçalho Operacional:**
   - Título acessível, seletor de data/semana (Hoje, Próximos 7 dias, Próximos 30 dias) e botão tátil destacado: **"+ Disponibilizar Novos Horários"**.
2. **Cards de Resumo Rápido da Semana:**
   - 🟢 Horários Livres na Vitrine
   - 🔵 Consultas Agendadas
   - ⚪ Horários Bloqueados / Pausas
3. **Grade Visual de Horários:**
   - Agrupamento visual por dia da semana (ex: "Segunda-feira, 03/11/2026").
   - Cards de slots táteis (mínimo 48px de altura) com badges semânticas:
     - `LIVRE`: Tag verde esmeralda com botão para "Bloquear" ou "Excluir".
     - `OCUPADO`: Tag azul marinho com nome do paciente idoso e atalho de visualização.
     - `BLOQUEADO`: Tag cinza neutro com botão para "Desbloquear (Tornar Livre)" ou "Excluir".
4. **Modal Acessível de Geração de Horários (`GerarHorariosModal.tsx`):**
   - Abas claras: **"Turno em Lote (Recomendado)"** e **"Horário Avulso"**.
   - Campos táteis: Data, Horário Início, Horário Fim, Duração da Consulta (45 min, 50 min, 60 min), Pausa entre consultas (0, 10, 15 min).
   - Cálculo reativo em tempo real: *"Esta configuração gerará 4 consultas de 50 min com 10 min de pausa."*
   - Feedback e confirmações integrados ao [`FeedbackModal.tsx`](../../frontend-react/src/components/common/FeedbackModal.tsx).

---

## 6. Critérios de Aceite em Formato BDD (Gherkin)

```gherkin
Funcionalidade: Gestão da Agenda e Grade de Horários Médicos (UC10)
  Como um médico geriatra credenciado e homologado pelo CFM
  Eu quero cadastrar e gerenciar meus horários de atendimento no consultório virtual
  Para que pacientes idosos possam agendar teleconsultas nos meus horários disponíveis

  Cenário 1: Médico com dossiê homologado gera grade de horários matutina em lote (Caminho Feliz)
    Dado que a "Dra. Ada Lovelace" está autenticada com perfil "ROLE_MEDICO" e status "APPROVED"
    Quando acessa sua agenda em "/medico/agenda" e solicita gerar turnos em lote:
      | Data       | 05/11/2026 |
      | Início     | 08:00      |
      | Término    | 12:00      |
      | Duração    | 50 min     |
      | Pausa      | 10 min     |
    Então o sistema gera 4 slots de atendimento com status "LIVRE":
      | Slot 1 | 08:00 às 08:50 |
      | Slot 2 | 09:00 às 09:50 |
      | Slot 3 | 10:00 às 10:50 |
      | Slot 4 | 11:00 às 11:50 |
    E exibe mensagem de sucesso via FeedbackModal
    E os horários ficam imediatamente disponíveis para a vitrine pública de pacientes.

  Cenário 2: Médico tenta cadastrar horário sobreposto ou duplicado (Caminho Triste)
    Dado que o médico já possui um slot cadastrado para "05/11/2026 às 14:00"
    Quando tenta cadastrar manualmente outro slot avulso com o mesmo início "05/11/2026 às 14:00"
    Então o sistema rejeita a operação com HTTP 400 Bad Request
    E exibe a mensagem: "Você já possui um horário disponibilizado neste mesmo dia e horário."

  Cenário 3: Médico bloqueia temporariamente um horário livre para reunião de equipe (Caminho Feliz)
    Dado que o médico possui um horário com status "LIVRE" às 10:00
    Quando clica na opção "Bloquear Horário"
    Então o status do slot é alterado para "BLOQUEADO"
    E o horário é imediatamente removido da visualização de agendamento dos pacientes.

  Cenário 4: Médico tenta excluir um slot que já possui consulta confirmada (Caminho Triste)
    Dado que um slot do médico está com status "OCUPADO" agendado com o paciente "Antônio Silva"
    Quando o médico tenta excluir o slot diretamente pela lixeira da grade
    Então o sistema bloqueia a exclusão com HTTP 400 Bad Request
    E exibe o alerta: "Horários com consultas agendadas não podem ser excluídos diretamente. Utilize a opção de cancelamento de consulta."

  Cenário 5: Médico com dossiê pendente tenta acessar ou disponibilizar agenda (RN008 / Segurança)
    Dado que o médico possui status de credenciamento "PENDING_DOCS" ou "UNDER_REVIEW"
    Quando tenta enviar uma requisição para "/api/doctor/schedule/batch"
    Então o backend retorna HTTP 403 Forbidden
    E a mensagem informa: "Seu consultório virtual só pode ser ativado após a homologação do Dossiê pelo CFM."
```

---

## 7. Plano de Execução & Micro Tarefas

1. **Micro Tarefa 9.1 (Backend Domain & Persistence):**
   - Criar enum `SlotStatus.java`;
   - Criar model `DoctorScheduleSlot.java` com índice composto único no MongoDB Atlas;
   - Criar repositório `DoctorScheduleSlotRepository.java` com consultas por janela de datas e status.
2. **Micro Tarefa 9.2 (Backend DTOs, Service & Controller):**
   - Criar DTOs `CreateSlotRequest.java`, `CreateBatchSlotsRequest.java` e `DoctorScheduleSlotResponse.java`;
   - Implementar `DoctorScheduleService.java` com lógica de lote, validação de sobreposição, trava de dossiê aprovado e trava contra exclusão de slot ocupado;
   - Implementar `DoctorScheduleController.java` com Swagger OpenAPI;
   - Escrever testes unitários em `DoctorScheduleServiceTest.java`.
3. **Micro Tarefa 9.3 (Frontend SPA - Gestão de Agenda):**
   - Criar modal `GerarHorariosModal.tsx` com geração em lote e slots avulsos;
   - Criar tela principal `MinhaAgenda.tsx` (`/medico/agenda`) com cards semanais e botões táteis;
   - Conectar o botão do `DashboardMedico.tsx` para direcionar a `/medico/agenda`;
   - Configurar rotas no `App.tsx` sob `ProtectedRoute.tsx`.
4. **Micro Tarefa 9.4 (Disponibilidade Pública para Vitrine):**
   - Expor endpoint público/autenticado `GET /api/doctors/{id}/availability` para alimentar os cards do médico e preparar o **UC09**.
5. **Micro Tarefa 9.5 (Homologação & Deploy):**
   - Testar o fluxo ponta a ponta no backend e frontend;
   - Atualizar a documentação oficial (`PLANO_DE_RELEASE_ACTIVE_AGE.md` e `ROTEIRO_DE_TESTES_BDD_ACTIVE_AGE.md`);
   - Git Commit e Push na branch `main`.
