# 📋 ESPECIFICAÇÃO TÉCNICA (SPEC): SEEDING DE MÉDICOS HOMOLOGADOS (HOMENAGEM À TECNOLOGIA)

> **Código da Spec:** SPEC-05C  
> **Projeto:** Active Age — Plataforma Integral de Telessaúde Geriátrica  
> **Módulo:** Inicialização e Massa de Dados de Teste (`DataInitializer`)  
> **Casos de Uso Relacionados:** UC01, UC03, UC04, UC08, UC09 (Vitrine de Especialistas)  
> **Requisitos Funcionais / Regras de Negócio:** RF001, RF003, RF005, RN004  
> **Normas de Referência Ética & Regulatória:** Resolução CFM nº 2.314/2022, Resolução CFM nº 2.336/2023, Padrões SBIS NGS1  
> **Data:** 28 de Outubro de 2026  
> **Status:** CONCLUÍDA E HOMOLOGADA EM PRODUÇÃO ✅  
> **Metodologia:** Spec-Driven Development (SDD)

---

## 1. Contexto & Objetivo

Com a aprovação da Release v0.2.0 (Módulo de Credenciamento e Dashboards) e a iminência da **Release v0.3.0 (Vitrine de Horários e Agendamento)**, torna-se necessário dispor de uma massa de dados consistente de **médicos já homologados e aprovados** no banco de dados.

Atualmente, o semeador `DataInitializer.java` cria apenas o usuário Administrador padrão (`admin@activeage.com`). Se um desenvolvedor ou avaliador precisar testar o fluxo de atendimento médico, gerenciamento de agenda ou a futura vitrine de busca, precisaria cadastrar manualmente um médico, enviar 7 documentos e aprová-lo no painel de administração toda vez.

Atendendo à diretiva do Product Owner (Guilherme Silva), este incremento povoará automaticamente médicos pioneiros homenageando os **grandes nomes da história da computação e tecnologia**.

---

## 2. Personagens Históricos Selecionados

| Nome Homenageado | E-mail de Acesso | CRM / UF | Data / Marco Tecnológico Homenageado | Banco / Chave PIX |
| :--- | :--- | :---: | :--- | :--- |
| **Dra. Ada Lovelace** | `ada.lovelace@activeage.com` | `184201/SP` | **1842:** Autora do primeiro algoritmo processado por uma máquina. | `341 - Itaú Unibanco S.A.` (PIX: E-mail) |
| **Dr. Alan Turing** | `alan.turing@activeage.com` | `193602/SP` | **1936:** Artigo seminal da Máquina Universal de Turing e criptoanálise. | `001 - Banco do Brasil S.A.` (PIX: E-mail) |
| **Dra. Grace Hopper** | `grace.hopper@activeage.com` | `195203/SP` | **1952:** Criadora do primeiro compilador (A-0) e pioneira do COBOL. | `260 - Nu Pagamentos S.A.` (PIX: E-mail) |
| **Dra. Margaret Hamilton** | `margaret.hamilton@activeage.com` | `196904/SP` | **1969:** Diretora de software da missão Apollo 11 (Homem na Lua). | `077 - Banco Inter S.A.` (PIX: E-mail) |
| **Dr. Tim Berners-Lee** | `tim.bernerslee@activeage.com` | `198905/SP` | **1989:** Inventor da World Wide Web (WWW, HTTP e HTML). | `237 - Banco Bradesco S.A.` (PIX: E-mail) |

> **Senha Universal para Testes dos Médicos Semeados:** `ActiveAge2026!` (Criptografada via BCrypt no `DataInitializer`).

---

## 3. Estrutura dos Registros no MongoDB Atlas (`users`)

Cada médico semeado receberá o estado completo de um profissional plenamente habilitado:

1. **Identificação e Perfil:**
   - `role`: `Role.ROLE_MEDICO`
   - `active`: `true`
   - `termsAccepted`: `true`
   - `createdAt`: `LocalDateTime.now().minusDays(15)`
2. **Dossiê Regulatório Homologado (CFM Res. 2.314/2022):**
   - `dossierStatus`: `DoctorDossierStatus.APPROVED`
   - `submittedAt`: `LocalDateTime.now().minusDays(12)`
   - `approvedAt`: `LocalDateTime.now().minusDays(10)`
   - `trialExpiresAt`: `LocalDateTime.now().plusDays(5)` *(15 dias de teste grátis com 5 dias restantes)*
3. **Dados Financeiros para Split Direto:**
   - Preenchimento completo de `financialInfo`: Banco com código COMPE oficial, agência, conta corrente e chave PIX cadastrada.
4. **Idempotência (Garantia de Não Duplicação):**
   - Cada inserção verifica `!userRepository.existsByEmail(...)` antes de persistir, evitando duplicações a cada reinicialização da aplicação.

---

## 4. Plano de Implementação em Micro Tarefas

- **Micro Tarefa 1 (Backend Core - `DataInitializer.java`):**
  - Implementar método auxiliar privado `seedDoctorIfNotExists(...)`.
  - Cadastrar os 5 médicos históricos com suas credenciais, CRM e dados bancários homologados.
- **Micro Tarefa 2 (Validação & Testes):**
  - Executar compilação com `mvnw test-compile`.
  - Executar inicialização local e verificar os logs do Spring Boot confirmando a criação idempotente dos 5 médicos.
- **Micro Tarefa 3 (Commit & Push):**
  - Commit em português com padrão Conventional Commits (`feat(seed): adiciona medicos pioneiros da tecnologia homologados no DataInitializer`).
  - Atualização do catálogo oficial de specs (`README.md`).

---

## 5. Critérios de Aceite

1. Ao subir o backend, os 5 médicos são inseridos no MongoDB caso ainda não existam.
2. É possível realizar login na plataforma com qualquer um dos 5 e-mails usando a senha `ActiveAge2026!`.
3. Ao logar, o médico é redirecionado diretamente para `/medico/dashboard` e visualiza o banner verde de **"Credenciamento Homologado • Res. CFM nº 2.314/2022"**, com o consultório virtual destravado.
4. Na tela do Administrador (`/admin/credenciamento` e `/admin/usuarios`), os 5 médicos aparecem como ativos e homologados.
