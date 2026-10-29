# 📋 ESPECIFICAÇÃO TÉCNICA (SPEC): GESTÃO DE PERFIL DO USUÁRIO (MÉDICO & PACIENTE)

> **Código da Spec:** SPEC-06  
> **Projeto:** Active Age — Plataforma Integral de Telessaúde Geriátrica  
> **Módulo:** Perfil do Usuário, Identidade Visual (Avatar) e Dados de Atendimento / Cuidador  
> **Casos de Uso Relacionados:** UC18 (Manter Perfil de Usuário) — Requisito Funcional: RF014 (Reflete em UC08, UC09 na Vitrine de Especialistas)  
> **Normas de Referência Ética & Regulatória:** Resolução CFM nº 2.336/2023 (Publicidade Médica e Bio), Resolução CFM nº 2.314/2022, Lei Geral de Proteção de Dados (LGPD nº 13.709/2018)
> **Data:** 28 de Outubro de 2026  
> **Status:** CONCLUÍDA E HOMOLOGADA EM PRODUÇÃO ✅  
> **Metodologia:** Spec-Driven Development (SDD)

---

## 1. Contexto & Diagnóstico da Necessidade

Atualmente, a plataforma Active Age permite o cadastro inicial de Pacientes e Médicos, a submissão do Dossiê de Credenciamento e o acesso aos Dashboards. Contudo, **não existe uma interface ou endpoint dedicado para que o usuário visualize e atualize seus dados de perfil**, adicione uma **foto (avatar)** e configure informações essenciais para a relação médico-paciente.

### Por que essa funcionalidade é prioritária agora?
1. **Para a Vitrine de Especialistas (Sprint 3 / UC09):** A vitrine de agendamento de teleconsultas precisa exibir a foto do médico, sua biografia resumida, áreas de foco clínico (ex: *Demências, Prevenção de Quedas, Polifarmácia*), valor da consulta e tempo de duração. Sem a edição do perfil médico, esses dados teriam que ser estáticos.
2. **Para a Humanização do Atendimento Geriátrico (IHC / WCAG):** A foto do paciente e do médico reduz a ansiedade do idoso antes de entrar na sala de vídeo, permitindo reconhecimento mútuo instantâneo.
3. **Para a Segurança e Conformidade Clínica (CFM & LGPD):**
   - Prescrições digitais regulamentadas exigem o endereço residencial do paciente.
   - O atendimento ao idoso requer os dados de contato do **Cuidador / Familiar Responsável** para situações de emergência ou apoio técnico durante a teleconsulta.

---

## 2. Requisitos Funcionais por Papel de Acesso

### 2.1. Perfil do Médico Geriatra (`ROLE_MEDICO`)

O perfil médico deve atender estritamente à **Resolução CFM nº 2.336/2023** (Publicidade Médica: caráter informativo, proibição de autopromoção sensacionalista ou promessa de resultados):

| Campo | Tipo / Formato | Editável pelo Médico? | Descrição & Regra de Negócio |
| :--- | :--- | :---: | :--- |
| **Foto de Perfil (Avatar)** | Imagem (JPG, PNG, WEBP máx. 5MB) | **Sim** | Foto de rosto profissional (jaleco ou traje profissional). |
| **Nome Completo** | Texto | Não direto | Vinculado ao CRM (alteração exige suporte/documento). |
| **CRM e UF** | Texto | **Não (Travado)** | Imutável pelo médico. Alterações de CRM exigem revalidação da auditoria. |
| **RQE (Registro de Especialista)** | Texto (ex: `RQE 45812`) | **Sim** | Registro de qualificação em Geriatria (mandatório para divulgar título). |
| **Telefone / WhatsApp** | Máscara `(00) 00000-0000` | **Sim** | Contato profissional para notificações da plataforma. |
| **Mini-Biografia / Trajetória** | Texto (máx. 1.000 caracteres) | **Sim** | Formação acadêmica, residência médica e experiência em geriatria. |
| **Áreas de Foco Clínico** | Lista de tags pré-definidas | **Sim** | Tags: *Avaliação Geriátrica Ampla (AGA), Memória e Demências, Prevenção de Quedas, Polifarmácia, Cuidados Paliativos, Longevidade Ativa*. |
| **Valor da Consulta (Honorários)** | Moeda BRL (ex: `R$ 350,00`) | **Sim** | Valor bruto da teleconsulta a ser liquidado via Split Direto (sem dicotomia). |
| **Duração Estimada da Consulta** | Inteiro (Minutos: 30, 45 ou 60) | **Sim** | Duração padrão do slot para agendamento (padrão sugerido: 50 min). |
| **Link do Currículo Lattes** | URL | **Sim** | Link público oficial do CNPq para transparência científica. |

---

### 2.2. Perfil do Paciente & Cuidador (`ROLE_PACIENTE`)

Voltado à acessibilidade, com botões ampliados e formulários simplificados (IHC Geriátrico):

| Campo | Tipo / Formato | Editável pelo Paciente? | Descrição & Regra de Negócio |
| :--- | :--- | :---: | :--- |
| **Foto de Perfil (Avatar)** | Imagem (JPG, PNG, WEBP máx. 5MB) | **Sim** | Foto do idoso ou da família para humanização do prontuário. |
| **Nome Completo** | Texto | Não direto | Vinculado ao cadastro civil / CPF. |
| **CPF e Data de Nascimento** | Máscaras oficiais | **Não (Travados)** | Dados regulatórios imutáveis para proteção contra roubo de identidade. |
| **Telefone Celular / WhatsApp** | Máscara `(00) 00000-0000` | **Sim** | Canal de envio de links de teleconsulta e lembretes. |
| **Endereço Residencial** | CEP, Logradouro, Nº, Compl, Bairro, Cidade, UF | **Sim** | Necessário para emissão e validação de receitas com entrega em farmácias. |
| **Possui Cuidador / Familiar?** | Booleano (Sim / Não) | **Sim** | Identifica se o paciente possui apoio domiciliar. |
| **Nome do Cuidador Responsável** | Texto | **Sim** | Nome da pessoa que acompanha o idoso. |
| **Grau de Parentesco** | Select | **Sim** | Opções: *Filho(a), Cônjuge, Neto(a), Cuidador Profissional, Outro*. |
| **WhatsApp do Cuidador** | Máscara `(00) 00000-0000` | **Sim** | Contato direto para emergências ou instruções pós-consulta. |
| **Ficha Básica de Saúde (Opcional)** | Tipo Sanguíneo, Alergias, Comorbidades | **Sim** | Informações prévias declaratórias para auxílio na anamnese do médico. |

---

## 3. Arquitetura da Solução & Modelagem de Dados

### 3.1. Expansão da Entidade `User.java` (MongoDB Atlas)

```java
// Subdocumento de Endereço Residencial
private UserAddress address;

// Subdocumento do Cuidador Familiar (Exclusivo Paciente)
private CaregiverInfo caregiver;

// Subdocumento de Resumo Clínico Declarado (Exclusivo Paciente)
private PatientHealthSummary healthSummary;

// Foto de Perfil (Avatar)
private String avatarUrl;

// Campos Médicos Específicos para a Vitrine (Exclusivo Médico)
private String rqe;
private String bio;
private List<String> clinicalFocus;
private BigDecimal consultationFee;
private Integer consultationDurationMinutes;
private String lattesUrl;
```

### 3.2. Endpoints da API RESTful (`UserController` / `/api/users/profile`)

1. **`GET /api/users/profile/me`:**
   - Retorna o perfil completo do usuário autenticado a partir do token da sessão.
2. **`PUT /api/users/profile/doctor`:**
   - Atualiza biografia, RQE, áreas de foco, valor de consulta, duração e links do médico.
3. **`PUT /api/users/profile/patient`:**
   - Atualiza telefone, endereço completo, dados do cuidador e ficha preliminar de saúde.
4. **`POST /api/users/profile/avatar` (Multipart/form-data):**
   - Recebe a imagem (máx. 5MB), valida tipo MIME, armazena em diretório seguro e salva o caminho no `User`.
5. **`GET /api/users/profile/avatar/{filename}`:**
   - Endpoint público/seguro com cache HTTP para carregar o avatar nas telas e na vitrine.

### 3.3. Interface do Usuário (Frontend React)

1. **Nova Rota Médica: `/medico/perfil`**
   - Visualização estilo cartão profissional com upload de foto com crop/preview.
   - Edição de valor de consulta e duração estimada.
   - Seletor tátil de tags de especialidades geriátricas.
2. **Nova Rota do Paciente: `/paciente/perfil`**
   - Layout limpo em abas acessíveis:
     - *Aba 1: Meus Dados Pessoais e Foto*
     - *Aba 2: Meu Endereço Residencial*
     - *Aba 3: Meu Cuidador / Familiar de Apoio*
     - *Aba 4: Informações de Saúde (Alergias e Tipo Sanguíneo)*
3. **Integração na Navegação:**
   - Adição do botão "Meu Perfil" e avatar miniatura no topo do `DashboardMedico.tsx`, `DashboardPaciente.tsx` e `Navbar.tsx`.

---

## 4. Plano de Implementação em Micro Tarefas

- **Micro Tarefa 1 (Modelos & DTOs Backend):**
  - Criar subdocumentos `UserAddress`, `CaregiverInfo`, `PatientHealthSummary` e expandir `User.java`.
  - Criar DTOs `UpdateDoctorProfileRequest` e `UpdatePatientProfileRequest` com validações Jakarta.
- **Micro Tarefa 2 (Serviço & Endpoints Backend):**
  - Implementar métodos de atualização no `UserService` e upload de foto em `FileStorageService`.
  - Criar `UserProfileController` com os 5 endpoints RESTful.
- **Micro Tarefa 3 (Página de Perfil do Médico - Frontend):**
  - Criar `PerfilMedico.tsx` com upload de foto, pré-visualização, formatação de valor monetário (R$) e tags de foco clínico.
- **Micro Tarefa 4 (Página de Perfil do Paciente - Frontend):**
  - Criar `PerfilPaciente.tsx` com foco em acessibilidade (IHC Geriátrico), dados de endereço e cuidador familiar.
- **Micro Tarefa 5 (Roteamento & Navbar):**
  - Adicionar rotas em `App.tsx` sob `ProtectedRoute`.
  - Adicionar links e avatar dinâmico na `Navbar.tsx` e nos cabeçalhos dos Dashboards.
- **Micro Tarefa 6 (Testes, Build & Deploy):**
  - Compilar backend com `mvnw test-compile` e frontend com `npm run build`.
  - Commit e push para produção.

---

## 5. Critérios de Aceite

1. O médico consegue fazer upload de sua foto de perfil e visualizar a imagem atualizada no cabeçalho.
2. O médico consegue definir seu valor de consulta e sua biografia, persistindo as informações no MongoDB.
3. O paciente consegue cadastrar seu endereço residencial e os dados do seu cuidador familiar (nome, parentesco e WhatsApp de emergência).
4. Dados sensíveis (CRM, CPF e E-mail) permanecem protegidos contra alterações arbitrárias pelo formulário.
5. Em caso de sucesso ou erro, a interface utiliza estritamente o componente acessível `FeedbackModal.tsx`.
