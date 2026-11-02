# 📋 ESPECIFICAÇÃO TÉCNICA SDD — SPEC-14
## Ativação Integral da Central de Prontuários & Prescrições Digitais no Dashboard do Médico

> **Status:** Proposta Técnica Submetida para Aprovação do PO (Guilherme Silva)  
> **Data:** 02/11/2026  
> **Contexto:** Plataforma Active Age — Consultório Virtual do Médico & Gestão de Documentos Clínicos  
> **Arquivos Envolvidos:**
> - `3-Semestre/backend-core/src/main/java/com/activeage/core/controllers/AppointmentController.java`
> - `3-Semestre/backend-core/src/main/java/com/activeage/core/services/AppointmentService.java`
> - `3-Semestre/backend-core/src/main/java/com/activeage/core/repositories/AppointmentRepository.java`
> - `3-Semestre/frontend-react/src/pages/medico/DashboardMedico.tsx`
> - `3-Semestre/frontend-react/src/components/teleconsulta/DoctorRecordsManagerModal.tsx` (Novo Componente)

---

### 1. Diagnóstico do Problema & Motivação

No `DashboardMedico.tsx`, a ferramenta **"Prontuário & ICP-Brasil"** (Card 3 das ferramentas do consultório) exibia um modal estático com a mensagem:
> *"O prontuário eletrônico e a emissão de receitas com assinatura digital ICP-Brasil estarão disponíveis em breve!"*

Isso impedia o médico de acessar a gestão dos prontuários e prescrições diretamente por esse atalho do dashboard, gerando a percepção de que o módulo de prontuário e prescrição digital não estava integrado.

---

### 2. Solução Proposta

#### 2.1. Backend (`backend-core`)
1. **Endpoint `GET /api/doctor/appointments`:**
   - Adicionar ao `AppointmentController.java` e `AppointmentService.java` o endpoint protegido por `hasRole('MEDICO')` que retorna todas as teleconsultas do médico autenticado ordenadas por data decrescente (`findByDoctorIdOrderByStartDateTimeDesc`).
2. **Método no Repositório:**
   - Em `AppointmentRepository.java`, adicionar:
     ```java
     List<Appointment> findByDoctorIdOrderByStartDateTimeDesc(String doctorId);
     ```

#### 2.2. Frontend (`frontend-react`)
1. **Novo Componente [`DoctorRecordsManagerModal.tsx`](file:///c:/Users/guilh/OneDrive/Documentos/active-age/3-Semestre/frontend-react/src/components/teleconsulta/DoctorRecordsManagerModal.tsx):**
   - Modal amplo e acessível para o médico gerenciar seus prontuários e prescrições:
     - Barra de busca em tempo real por nome do paciente;
     - Filtros rápidos: "Todos os Atendimentos", "Consultas Realizadas", "Próximas Agendadas";
     - Listagem de atendimentos com dados do paciente, data/horário e status;
     - Botão **"Ver Prontuário Clínico"** que abre o `MedicalRecordViewModal` com o relatório médico, CID-11 e hash SHA-256;
     - Botão **"Ver Documentos & Receitas"** para consultar e reimprimir qualquer receita, pedido de exame ou atestado em Preto e Branco (`DocumentPrintModal`).
2. **Ativação Real no `DashboardMedico.tsx`:**
   - Eliminar a chamada `handleFeatureNotice('Prontuário & Prescrição Digital', '...em breve!')`.
   - Ao clicar no Card 3 ("Prontuário & ICP-Brasil"), abrir diretamente a **Central de Prontuários & Prescrições Digitais** (`DoctorRecordsManagerModal`).

---

### 3. Critérios de Aceite
- [ ] O clique na ferramenta "Prontuário & ICP-Brasil" no Dashboard do Médico abre a Central de Prontuários e Prescrições funcionais, sem qualquer aviso de "em breve".
- [ ] O médico consegue visualizar a listagem completa de seus atendimentos e prontuários.
- [ ] O médico consegue abrir qualquer prontuário finalizado para consulta do relatório e conferência do hash SHA-256.
- [ ] O médico consegue visualizar e imprimir qualquer receita ou atestado emitido em modelo timbrado P&B.
- [ ] Endpoint `GET /api/doctor/appointments` implementado e homologado no backend com testes passando.
- [ ] Build do Vite e do Maven passam com 0 erros.
- [ ] Commits realizados com Conventional Commits em português e push no GitHub.

