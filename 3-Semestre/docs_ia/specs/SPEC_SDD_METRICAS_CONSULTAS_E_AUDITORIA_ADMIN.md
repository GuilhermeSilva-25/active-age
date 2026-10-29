# 📋 ESPECIFICAÇÃO TÉCNICA (SPEC): RASTREABILIDADE DE TELECONSULTAS NA TRILHA DE AUDITORIA E PAINEL DE MÉTRICAS OPERACIONAIS DO ADMIN

> **Código da Spec:** SPEC-11C  
> **Projeto:** Active Age — Plataforma Integral de Telessaúde Geriátrica  
> **Módulo:** Governança Administrativa, Métricas Operacionais & Trilha de Auditoria Imutável  
> **Casos de Uso Relacionados:** UC04 (Auditoria do Credenciamento), UC05 (Moderação de Usuários), UC09 (Agendamentos de Consultas)  
> **Normas de Referência Ética & Regulatória:** Resolução CFM nº 2.314/2022 (Rastreabilidade e Segurança em Telemedicina), SBIS NGS1 (Nível de Garantia de Segurança 1 - Trilha de Auditoria Inviolável), Lei Federal nº 13.709/2018 (LGPD - Sigilo Médico e Princípio da Necessidade no Acesso Administrativo)  
> **Data:** 29 de Outubro de 2026  
> **Status:** CONCLUÍDA E HOMOLOGADA ✅  
> **Metodologia:** Spec-Driven Development (SDD)

---

## 1. Contexto & Diagnóstico da Necessidade

Com a implantação do módulo de agendamento de teleconsultas (UC09) e da grade de turnos médicos (UC10), surge a necessidade de conectar esses eventos ao **Painel de Governança do Administrador (`ROLE_ADMIN`)**:
1. **Obrigatoriedade Regulatória de Auditoria (CFM & SBIS):**
   - Toda reserva atômica de consulta e todo cancelamento devem ser formalmente registrados na coleção imutável `audit_logs`.
   - Atualmente, o `AppointmentService` registra mensagens apenas no console/arquivo de logs (`log.info`), carecendo da persistência em banco para que o auditor/admin consulte os eventos na tela de Trilha de Auditoria (`/admin/auditoria`).
2. **Blindagem Inviolável de Sigilo Médico (LGPD Art. 11 & CFM):**
   - O administrador da plataforma atua na governança técnica e de infraestrutura. Ele **NÃO PODE** ter acesso ao conteúdo clínico protegido por sigilo profissional:
     - Vedado acesso às notas/sintomas do paciente (`patientNotes`);
     - Vedado acesso ao prontuário, diagnósticos CID e receitas médicas.
3. **Visibilidade Operacional & Métricas em Tempo Real no `AdminDashboard.tsx`:**
   - O gestor administrativo precisa visualizar a volumetria da plataforma de forma agregada:
     - Total de consultas agendadas ativas;
     - Total de consultas realizadas vs. canceladas;
     - Total de vagas de atendimento disponíveis na rede credenciada;
     - Monitoramento das ações mais recentes no feed de auditoria.

---

## 2. Modelagem & Arquitetura Backend

### 2.1. Injeção de `AuditService` no `AppointmentService.java`

No momento em que um paciente confirma ou cancela uma consulta, o serviço persistirá automaticamente um evento na coleção `audit_logs`:

1. **Ao Criar Agendamento (`createAppointment`):**
   - `action`: `"APPOINTMENT_CREATED"`
   - `userId`: ID do paciente
   - `userEmail`: E-mail do paciente
   - `userRole`: `"ROLE_PACIENTE"`
   - `targetUserId`: ID do médico agendado
   - `details`: `"Teleconsulta agendada com Dr(a). " + doctor.getFullName() + " (CRM " + doctor.getCrm() + "/" + doctor.getUfCrm() + ") para " + dataHoraFormatada`

2. **Ao Cancelar Agendamento (`cancelAppointment`):**
   - `action`: `"APPOINTMENT_CANCELLED"`
   - `userId`: ID do paciente
   - `userEmail`: E-mail do paciente
   - `userRole`: `"ROLE_PACIENTE"`
   - `targetUserId`: ID do médico
   - `details`: `"Teleconsulta com Dr(a). " + appointment.getDoctorName() + " para " + dataHoraFormatada + " cancelada pelo paciente. Horário liberado na agenda médica."`

---

### 2.2. DTO de Métricas Administrativas: `AdminStatsResponse.java`

Local: `com.activeage.core.dtos.responses.AdminStatsResponse`

```java
package com.activeage.core.dtos.responses;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminStatsResponse {
    private long totalPatients;
    private long totalApprovedDoctors;
    private long pendingDoctorsQueue;
    private long totalAppointments;
    private long scheduledAppointments;
    private long completedAppointments;
    private long cancelledAppointments;
    private long availableScheduleSlots;
}
```

---

### 2.3. Endpoint no Controller Administrativo: `AdminDashboardController.java`

Local: `com.activeage.core.controllers.AdminDashboardController`

* **Endpoint:** `GET /api/admin/stats`
* **Permissão:** `@PreAuthorize("hasRole('ADMIN')")`
* **Comportamento:**
  - Consulta os repositórios (`UserRepository`, `AppointmentRepository`, `DoctorScheduleSlotRepository`) utilizando contadores otimizados do MongoDB (`count()`).
  - Retorna o objeto `AdminStatsResponse` com status HTTP 200.

---

## 3. Arquitetura Frontend & Experiência de Governança

### 3.1. Cards Dinâmicos no `AdminDashboard.tsx`
* Substituição dos valores estáticos por dados reais consumidos de `GET /api/admin/stats`.
* Inclusão do novo Card de Destaque: **"Teleconsultas na Plataforma"**:
  - Exibe o número de consultas ativas (`scheduledAppointments`);
  - Subtítulo com o total histórico de atendimentos e vagas livres;
  - Link de atalho direto para a Trilha de Auditoria.

### 3.2. Suporte a Eventos de Consulta em `AuditLogs.tsx`
* Mapeamento dos novos tipos de ação na tabela de auditoria:
  - `APPOINTMENT_CREATED` → Tag estilizada em verde: `Consulta Agendada`
  - `APPOINTMENT_CANCELLED` → Tag estilizada em vermelho/laranja: `Consulta Cancelada`
* Filtro rápido permitindo isolar eventos de agendamento na lista de auditoria.

---

## 4. Critérios de Aceite & Validação (BDD)

* **Cenário 1: Registro Indelével de Agendamento em `audit_logs` (CFM / SBIS)**
  - **Dado** que o paciente idoso confirma uma consulta na plataforma
  - **Quando** o agendamento é salvo com sucesso
  - **Então** o sistema cria imediatamente um registro na coleção `audit_logs` com a ação `APPOINTMENT_CREATED` contendo data, hora, médico e paciente
  - **E** o log aparece na listagem do painel de auditoria do administrador.

* **Cenário 2: Registro Indelével de Cancelamento Ético**
  - **Dado** que o paciente cancela uma consulta com mais de 24h de antecedência
  - **Quando** a operação é concluída
  - **Então** o sistema gera um registro de auditoria com a ação `APPOINTMENT_CANCELLED` comprovando a desocupação do horário.

* **Cenário 3: Exibição Segura de Métricas no Painel do Administrador (LGPD)**
  - **Dado** que o administrador acessa `/admin/dashboard`
  - **Quando** a página é renderizada
  - **Então** exibe os contadores agregados de consultas ativas e vagas livres sem nunca exibir sintomas, diagnósticos ou laudos clínicos.

* **Cenário 4: Bloqueio Perimetral para Não-Administradores**
  - **Dado** que um usuário logado como `ROLE_PACIENTE` ou `ROLE_MEDICO` tenta acessar `GET /api/admin/stats`
  - **Então** o backend rejeita com status HTTP 403 Forbidden.

---

## 5. Solicitação de Aprovação

Guilherme, esta especificação atende perfeitamente ao que você deseja para a governança e auditoria do painel administrativo?
Com a sua **aprovação formal**, iniciaremos a implementação e o deploy!
