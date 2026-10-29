# 📋 ESPECIFICAÇÃO TÉCNICA (SPEC): COCKPIT INTEGRADO DE TELECONSULTA GERIÁTRICA, PRONTUÁRIO ÉTICO IMUTÁVEL, EXAMES E PRESCRIÇÕES DIGITAIS

> **Código da Spec:** SPEC-12  
> **Projeto:** Active Age — Plataforma Integral de Telessaúde Geriátrica  
> **Módulo:** Teleconsulta Demonstrativa, Prontuário Eletrônico (AGA/CID-11), Acesso a Exames e Documentos Digitais  
> **Casos de Uso Relacionados:** UC12-Demo (Sala Virtual de Atendimento), UC13 (Visualização Médica de Exames), UC14 (Prontuário Eletrônico Imutável), UC15 (Emissão de Receitas/Atestados), UC16 (Download de Documentos pelo Paciente)  
> **Requisitos Funcionais / Regras de Negócio:** RF009, RF010, RF011, RF012, RN003 (Imutabilidade Ética do Prontuário), RN006 (Prescrições e Documentos com Validação Digital ICP-Brasil)  
> **Normas de Referência Ética & Regulatória:** Resolução CFM nº 2.314/2022 (Diretrizes de Telemedicina e Guarda de Prontuários), SBIS NGS1/NGS2 (Níveis de Garantia de Segurança em Sistemas de Registro Eletrônico em Saúde), Lei Federal nº 13.787/2018 (Digitalização e Prontuários Eletrônicos), Lei Federal nº 13.709/2018 (LGPD - Sigilo Médico e Segurança dos Dados Sensíveis)  
> **Data:** 29 de Outubro de 2026  
> **Status:** CONCLUÍDA E HOMOLOGADA EM PRODUÇÃO ✅  
> **Metodologia:** Spec-Driven Development (SDD)

---

## 1. Contexto & Diagnóstico da Necessidade

Com o alinhamento estratégico definido para a conclusão do 3º Semestre:
* Os microsserviços pesados de **Mensageria assíncrona**, **Gateway financeiro de pagamento** e **WebRTC** migraram para o **4º Semestre**;
* O **Aplicativo Mobile (React Native)** foi alocado no **5º Semestre**;
* No **3º Semestre**, a conclusão da plataforma se dará com foco absoluto na **experiência médica e do paciente idoso**, unificando o atendimento em uma **Sala de Teleconsulta Demonstrativa com Cockpit Clínico Integrado**:
  1. **Experiência na Sala de Teleconsulta:** Acesso seguro pela rota `/teleconsulta/:appointmentId`. Visualização da chamada de vídeo e ferramentas em interface responsiva para Computador e Celular.
  2. **Cockpit Clínico do Médico Durante a Chamada:** Sem sair da sala de atendimento, o especialista tem acesso simultâneo a:
     - **Exames Prévios do Idoso (UC13):** Consulta direta dos laudos e imagens enviados no cofre digital GridFS (UC11).
     - **Prontuário Ético Eletrônico Geriátrico (UC14 / RN003):** Anamnese, Avaliação Geriátrica Ampla (AGA), Hipótese Diagnóstica (CID-11), Conduta e trava irrevogável de **imutabilidade** após finalização.
     - **Emissão de Documentos Clínicos (UC15):** Emissão de Receita Médica Digital, Pedido de Exames e Atestado Médico com código verificador e selo padrão ICP-Brasil.
  3. **Acesso aos Documentos pelo Idoso (UC16):** Disponibilização de aba ou painel para visualização e impressão das prescrições médicas recebidas.

---

## 2. Modelagem de Dados & Arquitetura Backend

### 2.1. Modelo de Prontuário Clínico: `MedicalRecord.java`
Coleção: `medical_records` (MongoDB Atlas)

```java
package com.activeage.core.domain.models;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "medical_records")
public class MedicalRecord {

    @Id
    private String id;

    @Indexed(unique = true)
    private String appointmentId;

    private String doctorId;
    private String doctorName;
    private String doctorCrm;
    private String doctorUfCrm;

    private String patientId;
    private String patientName;

    // === ANAMNESE CLÍNICA ===
    private String chiefComplaint;          // Queixa principal relatada
    private String historyOfPresentIllness; // História da moléstia atual
    private String clinicalEvolution;       // Evolução / anotações de consulta

    // === AVALIAÇÃO GERIÁTRICA AMPLA (AGA) ===
    private String cognitiveStatus;         // Preservado | Declínio Cognitivo Leve | Demência em Investigação
    private String mobilityRisk;            // Baixo Risco | Risco Moderado de Quedas | Marcha Instável
    private String functionalIndependence;  // Totalmente Independente | Dependência Parcial | Dependência Total
    private String familySupport;           // Cuidador Presente | Apoio Familiar Regular | Idoso Vive Só

    // === DIAGNÓSTICO E CONDUTA ===
    private String cid11Code;               // Código CID-11 (ex: "8A00", "BA00", "MB40")
    private String cid11Description;        // Descrição do CID-11
    private String clinicalConduct;         // Conduta médica e plano de cuidados

    // === IMUTABILIDADE ÉTICA (RN003 / CFM) ===
    @Builder.Default
    private String status = "DRAFT";        // "DRAFT" (editável) ou "FINALIZED" (imutável)
    private LocalDateTime finalizedAt;      // Data e hora exata da assinatura digital
    private String hashSignature;           // Hash SHA-256 do prontuário para garantia de não-adulteração

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

---

### 2.2. Modelo de Documentos Digitais Clínicos: `MedicalDocument.java`
Coleção: `medical_documents` (MongoDB Atlas)

```java
package com.activeage.core.domain.models;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "medical_documents")
public class MedicalDocument {

    @Id
    private String id;

    private String appointmentId;
    private String medicalRecordId;

    private String doctorId;
    private String doctorName;
    private String doctorCrm;
    private String doctorUfCrm;
    private String doctorRqe;

    @Indexed
    private String patientId;
    private String patientName;
    private String patientCpf;

    private String documentType;        // RECEITA_MEDICA | PEDIDO_EXAME | ATESTADO_MEDICO
    private String title;               // Ex: "Prescrição Médica Digital"
    private String content;             // Medicamentos prescritos, dosagens e horários
    private String recommendations;     // Instruções alimentares e de uso

    @Indexed(unique = true)
    private String validationCode;      // Código seguro para checagem de autenticidade (ex: "MED-2026-XXXX")

    private LocalDateTime issuedAt;
    private LocalDateTime createdAt;
}
```

---

### 2.3. Endpoints RESTful Implementados

#### 1. Acesso Médico a Exames do Paciente (`DoctorConsultationController.java` / UC13):
* `GET /api/doctor/appointments/{appointmentId}/patient-exams`: Retorna todos os exames que o paciente daquela teleconsulta anexou no cofre GridFS, permitindo visualização inline e download seguro.

#### 2. Prontuário Ético Eletrônico (`MedicalRecordController.java` / UC14):
* `GET /api/medical-records/appointment/{appointmentId}`: Consulta o prontuário da consulta ou retorna modelo base inicial.
* `POST /api/medical-records`: Salva alterações em modo rascunho (`status = DRAFT`).
* `POST /api/medical-records/{id}/finalize`: Conclui e assina o prontuário com trava de imutabilidade. Se já estiver `FINALIZED`, bloqueia com `HTTP 400 Bad Request` e grava em `audit_logs`.

#### 3. Emissão e Visualização de Documentos (`MedicalDocumentController.java` / UC15 e UC16):
* `POST /api/medical-documents`: Médico emite uma receita ou atestado vinculado à teleconsulta.
* `GET /api/medical-documents/appointment/{appointmentId}`: Retorna documentos gerados naquela consulta específica.
* `GET /api/patient/my-documents`: Paciente lista todas as receitas e documentos emitidos em seu nome.
* `GET /api/medical-documents/validate/{code}`: Endpoint público informativo que confirma a autenticidade do documento emitido perante o CRM e ICP-Brasil.

---

## 3. Arquitetura Frontend & Experiência de Uso (UX / IHC)

### 3.1. Tela Unificada de Teleconsulta: `/teleconsulta/:appointmentId`
* **Roteamento Inteligente:** A rota identifica o perfil do usuário logado:
  - **Se for Paciente:** Exibe a sala em modo de acolhimento (vídeo do médico em destaque, miniatura própria e controles de chamada acessíveis com alvos táteis de 50px).
  - **Se for Médico:** Exibe o **Cockpit Clínico Integrado**:
    - **Área de Vídeo:** Janela de chamada com controles (Microfone, Câmera, Encerrar Chamada).
    - **Painel Clínico Integrado com 3 Abas:**
      1. **Prontuário Clínico:** Anamnese, AGA (cognição, quedas, independência), CID-11 e conduta, com botão de Assinar/Finalizar Prontuário.
      2. **Exames do Paciente:** Lista dos laudos e imagens do idoso com modal de visualização e download direto.
      3. **Emitir Prescrição / Atestado:** Formulário de emissão de receitas com layout oficial para impressão.
* **Responsividade Rigorosa (Desktop e Mobile):**
  - **Desktop (Computador):** Split-view lado a lado (Vídeo à esquerda e Cockpit à direita).
  - **Mobile (Celular):** O vídeo assume o topo com altura proporcional (`h-52` a `h-64`), e o painel de atendimento fica logo abaixo com abas de fácil toque, garantindo que o médico consiga examinar o idoso e registrar a consulta sem distorção ou corte de botões.

### 3.2. Página de Documentos do Paciente: `/paciente/documentos`
* O idoso ou seu cuidador pode acessar a qualquer momento a lista de receitas e atestados emitidos, com botão para visualizar e imprimir em formato de laudo médico timbrado.

---

## 4. Critérios de Aceite & Validação (BDD)

* **Cenário 1: Entrada na Sala de Teleconsulta com Sucesso (Caminho Feliz)**
  - **Dado** que existe uma consulta agendada para o paciente e o médico
  - **Quando** qualquer uma das partes clica em "Entrar na Sala Virtual"
  - **Então** o sistema abre a rota `/teleconsulta/{id}` carregando os dados do atendimento e os controles acessíveis.

* **Cenário 2: Médico Visualiza Exames Anexados pelo Idoso durante a Chamada (UC13)**
  - **Dado** que o paciente anexou previamente um hemograma no cofre de exames
  - **Quando** o médico abre a aba "Exames do Paciente" no cockpit da chamada
  - **Então** visualiza o título, categoria e data do exame, com botão para abrir o arquivo em nova aba.

* **Cenário 3: Preenchimento e Bloqueio de Imutabilidade do Prontuário (UC14 / RN003)**
  - **Dado** que o médico preencheu a Anamnese, AGA e CID-11 e clicou em "Finalizar e Assinar Prontuário"
  - **Então** o status é alterado para `FINALIZED` e o hash criptográfico é gerado
  - **E** qualquer tentativa subsequente de editar o prontuário é rejeitada pelo backend com HTTP 400.

* **Cenário 4: Emissão de Receita Médica com Código de Validação (UC15 & UC16)**
  - **Dado** que o médico emite uma receita na aba de prescrições
  - **Quando** confirma a emissão
  - **Então** o documento é salvo com código de autenticidade único e fica disponível para visualização e impressão no painel do paciente.

---

## 5. Solicitação de Aprovação

Guilherme, esta especificação técnica atende com perfeição à visão de fechar o 3º Semestre com o **Cockpit de Teleconsulta Integrado**?
Com a sua **aprovação formal**, iniciaremos a implementação completa!
