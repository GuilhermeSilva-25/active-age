# ESPECIFICAÇÃO TÉCNICA (SPEC SDD) — RELEASE v0.1.0
## Fundação, Gestão de Identidade e Autenticação Segura
### Active Age — Telessaúde Geriátrica Integral | Fatec Diadema — DSM 3º Semestre
**Status:** Concluída e Homologada em Produção (Live) ✅  
**Data da Release:** 21 de Outubro de 2026  
**Casos de Uso Cobertos:** UC01 (Cadastrar-se na Plataforma) e UC02 (Autenticar-se / Login Seguro)  
**Requisitos Atendidos:** RF001, RNF001, RNF002, RNF003, RNF005, RNF006, RNF007, RN006  
**Ambientes de Produção:** Backend Render (Docker Web Service) | Frontend Vercel (SPA Edge) | Banco MongoDB Atlas  

---

### 1. Visão Geral e Objetivos da Release

A **Release v0.1.0** estabeleceu a pedra fundamental da engenharia do **Active Age**. O objetivo central foi implementar o ecossistema de cadastro de usuários (Paciente/Cuidador e Médico Geriatra), a camada de segurança com controle de acesso, criptografia irreversível de senhas e proteção contra ataques de força bruta, integrando o frontend React 19 com a API RESTful em Spring Boot 3 e o banco MongoDB Atlas.

---

### 2. Funcionalidades Entregues e Especificadas

| ID | Funcionalidade | Descrição Técnica da Implementação |
|---|---|---|
| **REL-01** | **Cadastro de Paciente / Cuidador** | Formulário guiado em 3 etapas com validação síncrona declarativa via React Hook Form e Zod (`patientSchema`), máscaras de CPF e telefone, cálculo dinâmico de maioridade (18+ anos obrigatório), consentimento da LGPD e persistência na coleção `users` via `POST /api/auth/register-patient`. |
| **REL-02** | **Pré-Cadastro de Médico Geriatra** | Formulário guiado em 3 etapas com máscaras de CRM e UF, aceite do termo ético do CFM e persistência com permissão `ROLE_MEDICO` e status inicial `PENDING_DOCS` via `POST /api/auth/register-doctor`. |
| **REL-03** | **Autenticação Segura (Login)** | Validação de credenciais no `AuthService` comparando o hash via `BCryptPasswordEncoder`, geração de token JWT stateless contendo `email` e `role`, e transporte encapsulado em **Cookie seguro** (`HttpOnly; Secure; SameSite=Strict; Path=/`), blindando a aplicação contra ataques XSS. |
| **REL-04** | **Proteção Ativa Contra Força Bruta (Rate Limiting)** | Algoritmo Token Bucket implementado via biblioteca **Bucket4j** na camada de serviço. Cada e-mail recebe um balde de 5 tentativas a cada 15 minutos. Na 6ª falha consecutiva, a conta é bloqueada temporariamente com mensagem amigável. |
| **REL-05** | **Identificação do Usuário Logado** | Endpoint protegido `GET /api/auth/me`. O `JwtAuthFilter` extrai o cookie, valida a assinatura criptográfica e retorna o perfil do usuário logado para a Navbar e o contexto global da SPA. |
| **REL-06** | **Encerramento de Sessão (Logout Seguro)** | Endpoint `POST /api/auth/logout`. O servidor Spring Boot emite cabeçalho `Set-Cookie` com `Max-Age=0`, invalidando o cookie no navegador de forma irreversível. |
| **REL-07** | **Navbar Reativa & Acessível** | Barra de navegação reativa que consulta `/api/auth/me`. Exibe saudação com primeiro nome e perfil quando autenticado (ex: *"Olá, Antônio (Paciente)"*) e botão de logout; quando anônimo, exibe botões *"Entrar"* e *"Criar Conta"*. |
| **REL-08** | **Favicon e Identidade Visual Oficial** | Substituição dos assets padrão do Vite pelo favicon oficial (coração + traçado de eletrocardiograma terracota) e título semântico da aba. |
| **REL-09** | **Documentação OpenAPI / Swagger** | Documentação viva gerada automaticamente via `springdoc-openapi` em `/swagger-ui/index.html` e `/v3/api-docs`. |
| **REL-10** | **Sistema de Modais Acessíveis (IHC / WCAG)** | Criação do componente `FeedbackModal.tsx` substituindo todos os diálogos nativos bloqueantes (`window.alert()`). Inclui foco gerenciado via teclado (`ref.current.focus()`), fechamento por `Escape`, contraste WCAG AA e botões com alvos táteis ampliados (48px+) para geriatria. |
| **REL-11** | **Validação Prévia de E-mail (Etapa 1)** | Endpoint público `GET /api/auth/check-email?email=...` com checagem assíncrona antes do avanço para a Etapa 2 dos cadastros, impedindo transição se o e-mail já existir. |
| **REL-12** | **Controle de Visibilidade de Senhas (IHC)** | Alternância dinâmica de visibilidade (`Eye` / `EyeOff`) nos campos de senha (Login e Cadastros), permitindo ao público idoso auditar o que digitou. |
| **REL-13** | **Tratador Global de Exceções (`GlobalExceptionHandler`)** | Anotação `@RestControllerAdvice` mapeando `IllegalArgumentException` para HTTP 400 Bad Request, padronizando retornos em JSON e eliminando erros 500 indevidos. |
| **REL-14** | **Conexão Visual no `ProgressBar` e Ícone `AlertCircle`** | Linha conectora de etapas dinâmica no `ProgressBar.tsx` e inclusão do ícone semântico `AlertCircle` em 100% das mensagens de validação (WCAG 2.1). |

---

### 3. Contratos de API Implementados

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuário (Browser)
    participant V as SPA React 19 (Vercel)
    participant B as API Spring Boot 3 (Render)
    participant DB as MongoDB Atlas

    Note over U,DB: Fluxo de Autenticação com Cookie HttpOnly
    U->>V: Informa e-mail e senha
    V->>B: POST /api/auth/login {email, password}
    B->>B: Verifica balde do Bucket4j (Rate Limit)
    B->>DB: Busca usuário por e-mail
    DB-->>B: Retorna registro com hash BCrypt
    B->>B: Valida senha com BCryptPasswordEncoder
    B->>B: Gera Token JWT com claims (email, role)
    B-->>V: HTTP 200 OK + Set-Cookie: accessToken=...; HttpOnly; Secure; SameSite=Strict
    V-->>U: Redireciona e atualiza Navbar reativa
```

#### 3.1. `POST /api/auth/register-patient`
* **Acesso:** Público
* **Payload de Entrada (`PatientRegisterRequest`):**
  * `fullName` (String, min 5, nome e sobrenome)
  * `email` (String, formato de e-mail válido)
  * `password` (String, min 6)
  * `cpf` (String, com máscara `999.999.999-99`)
  * `phone` (String, com máscara `(99) 99999-9999`)
  * `birthDate` (String, formato `DD/MM/AAAA`, idade >= 18 anos)
  * `termsAccepted` (Boolean, obrigatório `true`)
* **Resposta de Sucesso:** HTTP 200 OK com os dados do usuário criado.

#### 3.2. `POST /api/auth/register-doctor`
* **Acesso:** Público
* **Payload de Entrada (`DoctorRegisterRequest`):**
  * `fullName` (String, min 5, nome e sobrenome)
  * `email` (String, formato de e-mail válido)
  * `password` (String, min 6)
  * `cpf` (String, com máscara)
  * `phone` (String, com máscara)
  * `crm` (String, min 4 caracteres)
  * `ufCrm` (String, 2 caracteres em maiúsculo)
  * `termsAccepted` (Boolean, obrigatório `true`)
* **Resposta de Sucesso:** HTTP 200 OK com o médico criado com status `PENDING_DOCS`.

#### 3.3. `POST /api/auth/login`
* **Acesso:** Público
* **Payload de Entrada (`LoginRequest`):**
  * `email` (String)
  * `password` (String)
* **Resposta de Sucesso:** HTTP 200 OK com cabeçalho `Set-Cookie: accessToken=...; HttpOnly; Secure; SameSite=Strict; Path=/`.

#### 3.4. `POST /api/auth/logout`
* **Acesso:** Autenticado ou Público
* **Resposta de Sucesso:** HTTP 200 OK com cabeçalho `Set-Cookie: accessToken=; Max-Age=0; Path=/`.

#### 3.5. `GET /api/auth/me`
* **Acesso:** Autenticado via Cookie
* **Resposta de Sucesso:** HTTP 200 OK `{ "email": "...", "fullName": "...", "role": "...", "authenticated": true }`.

#### 3.6. `GET /api/auth/check-email?email=...`
* **Acesso:** Público
* **Resposta de Sucesso:** HTTP 200 OK `{ "available": true/false, "message": "..." }`.

---

### 4. Critérios de Aceite Validados (Testes BDD)

- [x] Cadastro de paciente com e-mail duplicado bloqueado com mensagem amigável.
- [x] Transição da Etapa 1 bloqueada imediatamente se o e-mail já estiver cadastrado.
- [x] Paciente menor de 18 anos impedido de submeter o cadastro com cálculo dinâmico de idade.
- [x] Cadastro de médico com CRM inválido impedido pelo schema de validação.
- [x] Senhas salvas com hash irreversível via BCrypt no MongoDB Atlas.
- [x] Tentativa de 5 erros de senha aciona bloqueio de 15 minutos do Bucket4j.
- [x] Logout apaga a credencial com `maxAge=0` e restabelece a Navbar no estado anônimo.
- [x] Comunicação de erros e sucessos via `FeedbackModal` acessível (sem alerts bloqueantes).
- [x] Alternância de visibilidade de senha com ícones táteis `Eye` e `EyeOff`.
- [x] Barra de progresso com linha conectora e ícone `AlertCircle` em todas as mensagens de validação.
- [x] Falha de login tratada pelo `GlobalExceptionHandler` retornando HTTP 400 Bad Request padronizado.
