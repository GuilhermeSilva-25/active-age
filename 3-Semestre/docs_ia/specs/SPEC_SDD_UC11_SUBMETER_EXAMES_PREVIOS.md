# 📋 ESPECIFICAÇÃO TÉCNICA (SPEC): SUBMISSÃO E GESTÃO DE EXAMES PRÉVIOS PELO PACIENTE

> **Código da Spec:** SPEC-08  
> **Projeto:** Active Age — Plataforma Integral de Telessaúde Geriátrica  
> **Módulo:** Cofre Digital de Saúde & Prontuário Ético do Paciente  
> **Casos de Uso Relacionados:** UC11 (Submeter Exames Prévios: Paciente faz upload de laudos antigos para análise do médico) — Reflete em UC13 (Médico visualiza histórico de exames)  
> **Requisitos Funcionais / Regras de Negócio:** RF008, RF014, RN003, RN007  
> **Normas de Referência Ética & Regulatória:** Resolução CFM nº 2.314/2022 (Telemedicina), Resolução CFM nº 1.821/2007 (Prontuário Eletrônico), Lei Federal nº 13.709/2018 (LGPD - Art. 11: Dados Pessoais Sensíveis de Saúde)  
> **Data:** 29 de Outubro de 2026  
> **Status:** CONCLUÍDA E HOMOLOGADA EM PRODUÇÃO ✅  
> **Metodologia:** Spec-Driven Development (SDD)

---

## 1. Contexto & Diagnóstico da Necessidade

No cuidado geriátrico, a **Avaliação Geriátrica Ampla (AGA)** depende criticamente da análise de exames e laudos pregressos (ex: hemogramas recentes, densitometrias ósseas, ecocardiogramas, ressonâncias magnéticas de crânio e dosagens hormonais). Idosos e seus cuidadores familiares frequentemente possuem pastas físicas com dezenas de exames impressos espalhados, o que dificulta o compartilhamento seguro em consultas virtuais.

Com a consolidação da infraestrutura de armazenamento permanente em nuvem via **MongoDB GridFS**, o Active Age tem agora o alicerce ideal para implantar o **Cofre Digital de Saúde**, permitindo que o paciente ou seu cuidador digitalize e anexe seus exames com antecedência para que o médico geriatra possa analisá-los com zelo prévio.

---

## 2. Conformidade Ético-Médica & Regulatória (CFM & LGPD)

1. **Sigilo e Proteção de Dados Sensíveis (LGPD Art. 11):**
   - Os exames médicos anexados constituem dados pessoais sensíveis de saúde.
   - O acesso a qualquer documento é estritamente restrito:
     - Ao próprio paciente titular (`ROLE_PACIENTE`) ou seu cuidador cadastrado;
     - Aos médicos credenciados da plataforma vinculados ao atendimento do paciente.
   - Nenhuma URL estática ou desprotegida deve existir para os arquivos (RN007).
2. **Formatos e Integridade Arquivística (CFM / SBIS):**
   - Suporte a formatos laboratoriais e radiológicos universais: **PDF, JPG, PNG e WEBP**;
   - Tamanho máximo por exame: **10 MB** (garante suporte a PDFs de laudos com múltiplas páginas e fotos nítidas tiradas por celular);
   - Os arquivos são armazenados de forma imutável no MongoDB GridFS, vinculados ao ID do paciente.

---

## 3. Modelagem de Dados & Arquitetura Backend

### 3.1. Entidade e Coleção: `PatientExam.java` (MongoDB Atlas)

Coleção: `patient_exams`

```java
package com.activeage.core.domain.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "patient_exams")
public class PatientExam {

    @Id
    private String id;

    /**
     * Identificador do paciente titular do exame (User.id).
     */
    private String patientId;

    /**
     * Título ou nome descritivo do exame (ex: "Hemograma e Perfil Lipídico").
     */
    private String title;

    /**
     * Categoria clínica do exame.
     */
    private ExamCategory category;

    /**
     * Data de realização do exame (declarada pelo paciente/cuidador).
     */
    private LocalDate examDate;

    /**
     * Observações adicionais do paciente ou cuidador (ex: "Jejum de 12 horas").
     */
    private String notes;

    /**
     * Nome único de armazenamento no MongoDB GridFS.
     */
    private String storedFileName;

    /**
     * Nome original do arquivo enviado.
     */
    private String originalFileName;

    /**
     * Tipo MIME do arquivo (application/pdf, image/jpeg, etc.).
     */
    private String contentType;

    /**
     * Tamanho do arquivo em bytes.
     */
    private long sizeBytes;

    /**
     * Data e hora do envio na plataforma.
     */
    private LocalDateTime uploadedAt;
}
```

### 3.2. Enum de Categorias Clínicas: `ExamCategory.java`

```java
package com.activeage.core.domain.enums;

public enum ExamCategory {
    LABORATORIAL("Exame Laboratorial / Sangue"),
    IMAGEM("Exame de Imagem (Raio-X, Tomografia, Ressonância)"),
    CARDIOLOGICO("Exame Cardiológico (ECG, Holter, MAPA)"),
    OUTROS("Outros Documentos Clínicos / Relatórios");

    private final String description;

    ExamCategory(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
```

### 3.3. DTOs de Requisição e Resposta

1. **`PatientExamResponse.java`:**
   - Retorna os metadados do exame para exibição na lista do cofre (id, title, category, categoryDescription, examDate, notes, originalFileName, contentType, sizeBytes, formattedSize, uploadedAt).
2. **`UploadExamRequest.java` (Multipart Parameters):**
   - `file`: MultipartFile (obrigatório, máx. 10MB);
   - `title`: String (obrigatório, 3 a 100 caracteres);
   - `category`: ExamCategory (obrigatório);
   - `examDate`: LocalDate (obrigatório, não pode ser data futura);
   - `notes`: String (opcional, máx. 500 caracteres).

### 3.4. Endpoints da API RESTful (`PatientExamController.java` / `/api/patient/exams`)

Todos os endpoints exigem autenticação do paciente (`ROLE_PACIENTE`):

1. **`POST /api/patient/exams` (Multipart/form-data):**
   - Salva o arquivo no MongoDB GridFS e persiste o registro em `patient_exams`.
   - Retorna `HTTP 201 Created` com `PatientExamResponse`.
2. **`GET /api/patient/exams`:**
   - Retorna a lista de todos os exames do paciente logado, ordenados pela data de realização decrescente (`examDate DESC`).
   - Suporte opcional a filtro por query param `category`.
3. **`GET /api/patient/exams/{id}/download`:**
   - Transmite o arquivo binário direto do GridFS via `Streaming/Resource`.
   - Permite visualização em tela (`inline`) para PDFs e imagens ou download direto.
4. **`DELETE /api/patient/exams/{id}`:**
   - Remove o arquivo do MongoDB GridFS e apaga o documento do banco.
   - Retorna `HTTP 200 OK` com mensagem de sucesso.

---

## 4. Design de Interface & Acessibilidade (IHC / WCAG 2.1 AA)

### 4.1. Nova Página: `MeusExames.tsx` (`/paciente/exames`)
- **Header:** Consistente com o Portal do Paciente, exibindo a logo oficial ampliada e botão *"← Voltar ao Dashboard"*.
- **Banner Educativo Geriátrico:**  
  *"Cofre de Saúde: Seus Laudos e Exames Prévios"*  
  Texto explicativo em fonte nítida: *"Mantenha seus exames organizados em um cofre digital seguro. Seus médicos geriatras terão acesso aos laudos durante o atendimento para avaliar sua evolução clínica."*
- **Ações Principais:**
  - Botão de Ação Rápida em destaque: **`+ Enviar Novo Exame ou Laudo`** (alvo tátil ampliado ≥48px);
  - Barra de filtro por Categoria em chips táteis (*Todos*, *Laboratoriais*, *Imagem*, *Cardiológicos*, *Outros*).
- **Cards de Exames do Paciente:**
  - Ícone representativo por categoria clínica;
  - Título do exame em destaque com badge colorido da categoria;
  - Metadados nítidos: *"Realizado em 15/05/2026 • Enviado em 29/10/2026"*;
  - Badge de formato e tamanho: *"PDF • 1.8 MB"*;
  - Observações do paciente em caixa destacada com ícone de anotação;
  - **Dois botões de ação:**
    1. **"Visualizar Laudo" (Botão Principal):** Abre o PDF/imagem em nova aba para visualização imediata com segurança;
    2. **"Excluir" (Botão Secundário):** Abre modal de confirmação acessível `FeedbackModal.tsx` antes de apagar permanentemente.
- **Empty State Amigável:**  
  Ilustração acolhedora informando que o paciente ainda não possui exames anexados e incentivando o primeiro envio com um botão direto.
- **Modal de Envio de Exame (`UploadExamModal.tsx`):**
  - Área tátil de seleção de arquivo (suporta arrastar e soltar ou clique do paciente/cuidador);
  - Validação de tipos permitidos e limite de 10MB;
  - Campos claros de preenchimento com máscaras e validação;
  - Botão de envio com spinner tátil durante o upload para o GridFS.

### 4.2. Integração no `DashboardPaciente.tsx`
- No Card 3 (*"Meu Cofre de Saúde"*), o clique passará a direcionar imediatamente para a rota `/paciente/exames`.

---

## 5. Roteiro de Testes e Critérios de Aceite (BDD)

```gherkin
Funcionalidade: Submissão e Gestão de Exames Prévios pelo Paciente (UC11 / RF008)
  Como um Paciente idoso ou Cuidador familiar
  Eu quero anexar laudos de exames antigos em formato PDF ou imagem
  Para que fiquem protegidos no meu cofre de saúde e disponíveis para análise do médico

  Cenário: Paciente anexa um laudo em formato PDF com sucesso (Caminho Feliz)
    Dado que o paciente está autenticado e na página de exames
    Quando preenche o título "Hemograma e Colesterol Total", seleciona a categoria "LABORATORIAL", a data "2026-05-10" e anexa um PDF de 2MB
    E clica em "Salvar no Cofre"
    Então o arquivo binário é armazenado de forma permanente no MongoDB GridFS
    E um novo exame é adicionado à lista do paciente com status de sucesso

  Cenário: Paciente visualiza o laudo anexado em nova aba
    Dado que o paciente possui um exame anexado no cofre
    Quando clica em "Visualizar Laudo"
    Então o sistema realiza a requisição autenticada GET /api/patient/exams/{id}/download
    E o arquivo PDF é transmitido com Content-Disposition inline para visualização no navegador

  Cenário: Tentativa de envio de arquivo maior que 10MB (Caminho Triste)
    Dado que o paciente seleciona um arquivo de 15MB
    Quando tenta realizar o upload
    Então o sistema bloqueia o envio e exibe um FeedbackModal alertando o limite de 10MB

  Cenário: Paciente exclui um exame enviado por engano
    Dado que o paciente clica em "Excluir" em um exame existente
    Quando confirma a exclusão no FeedbackModal
    Então o arquivo é apagado do MongoDB GridFS e do banco de dados
    E o card do exame desaparece da lista

  Cenário: Isolamento de dados entre pacientes (Segurança / LGPD)
    Dado que o paciente A tenta acessar o endpoint de download do exame do paciente B
    Quando a requisição é processada
    Então o sistema nega o acesso com HTTP 403 Forbidden ou HTTP 404 Not Found
```

---

## 6. Plano de Implementação

1. **Backend:**
   - Criar `ExamCategory.java` em `core/domain/enums/`;
   - Criar `PatientExam.java` em `core/domain/models/`;
   - Criar `PatientExamRepository.java` em `core/repositories/`;
   - Criar `PatientExamResponse.java` em `core/dtos/responses/`;
   - Criar `PatientExamService.java` com métodos de upload no GridFS, listagem, streaming seguro e exclusão;
   - Criar `PatientExamController.java` sob `/api/patient/exams` protegido por `ROLE_PACIENTE`;
   - Validar compilação com `./mvnw.cmd test-compile -o`.
2. **Frontend:**
   - Criar o modal `UploadExamModal.tsx` em `components/paciente/`;
   - Criar a página `MeusExames.tsx` em `pages/paciente/`;
   - Atualizar `DashboardPaciente.tsx` para ligar o Card 3 à rota `/paciente/exames`;
   - Registrar a rota `/paciente/exames` no `App.tsx` sob `ProtectedRoute`;
   - Validar build com `npm run build`.
3. **Documentação e Deploy:**
   - Atualizar `ROTEIRO_DE_TESTES_BDD_ACTIVE_AGE.md` e `PLANO_DE_RELEASE_ACTIVE_AGE.md`;
   - Commitar e dar push para a branch `main`.
