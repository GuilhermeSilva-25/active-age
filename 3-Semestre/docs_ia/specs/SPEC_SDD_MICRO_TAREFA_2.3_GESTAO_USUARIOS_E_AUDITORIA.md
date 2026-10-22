# ESPECIFICAÇÃO TÉCNICA (SPEC SDD) — MICRO TAREFA 2.3
## Gestão de Usuários & Trilha de Auditoria Global (`audit_logs`)
### Active Age — Telessaúde Geriátrica Integral | Fatec Diadema — DSM 3º Semestre
**Status:** Submetida para Aprovação do PO (Guilherme) ⏳  
**Data:** 22 de Outubro de 2026  
**Casos de Uso Cobertos:** UC01, UC02, UC04, UC05 (Moderação de Perfis e Auditoria de Conformidade)  
**Requisitos Atendidos:** RF001, RF003, RNF001, RNF002, RNF003, RNF005, RNF006, RNF007, RN007  
**Marcos Regulatórios:** SBIS/CFM (Padrão NGS1 - Rastreabilidade e Auditoria), Lei Geral de Proteção de Dados (Art. 37 da LGPD)  

---

### 1. Contexto e Objetivos

Com a entrega da fundação RBAC (Micro Tarefa 2.1) e do credenciamento médico nos 4 pilares (Micro Tarefa 2.2), a **Micro Tarefa 2.3** visa completar o tripé de governança administrativa do **Active Age**.

Seus objetivos são:
1. **Gestão e Moderação de Contas de Usuários (`/admin/usuarios`):** Prover ao Administrador a capacidade de visualizar todos os usuários cadastrados (Pacientes, Médicos e Administradores), aplicar filtros por perfil ou status, pesquisar por dados cadastrais e ativar/inativar contas (*soft-lock*), com proteção contra o auto-bloqueio acidental do administrador logado.
2. **Painel de Trilha de Auditoria Global (`/admin/auditoria`):** Disponibilizar a visualização centralizada e auditável dos registros da coleção `audit_logs` (NGS1 da SBIS e Art. 37 da LGPD), permitindo que auditores e administradores inspecionem acessos a documentos médicos, alterações de perfil, logins e decisões tomadas no sistema, com endereço IP e carimbo de data/hora.

---

### 2. Regras de Negócio e Segurança

1. **Restrição Perimetral Absoluta (RBAC):** Todos os endpoints e interfaces deste módulo são de acesso estrito a usuários autenticados com permissão `ROLE_ADMIN`.
2. **Proteção Contra Auto-Inativação:** Um administrador não pode desativar a própria conta através do painel. Tentativas retornam HTTP 400 Bad Request (*"Não é permitido inativar a própria conta de administrador"*).
3. **Registro Automático de Ações Administrativas:** Toda operação de ativação ou desativação de conta gera compulsoriamente um registro permanente em `audit_logs` contendo o ID do auditor, o ID do usuário afetado, a justificativa e o endereço IP.
4. **Imutabilidade da Trilha de Auditoria (NGS1):** A coleção `audit_logs` **não possui endpoints de alteração (`UPDATE`) ou deleção (`DELETE`)**. Uma vez gravado, o log permanece inalterável para garantir o não-repúdio.
5. **Acessibilidade e IHC (WCAG 2.1 AA):** Proibição estrita de `window.alert()` ou `confirm()`. Todas as confirmações de bloqueio/desbloqueio e feedbacks utilizam o componente [`FeedbackModal.tsx`](../../frontend-react/src/components/common/FeedbackModal.tsx).

---

### 3. Modelo de Dados e Contratos de API (Spring Boot 3)

#### 3.1. DTOs de Entrada e Saída

**1. `UserItemResponse` (Listagem de Usuários):**
```java
public class UserItemResponse {
    private String id;
    private String fullName;
    private String email;
    private String phone;
    private String cpf;
    private Role role;
    private boolean active;
    private String crm;
    private String ufCrm;
    private DoctorDossierStatus dossierStatus;
    private LocalDateTime createdAt;
}
```

**2. `UserStatusUpdateRequest` (Ativação / Inativação de Usuário):**
```java
public class UserStatusUpdateRequest {
    @NotNull(message = "O campo active é obrigatório.")
    private Boolean active;

    private String reason; // Justificativa da alteração de status
}
```

**3. `AuditLogResponse` (Item de Log de Auditoria):**
```java
public class AuditLogResponse {
    private String id;
    private String userId;
    private String userEmail;
    private String userRole;
    private String action;
    private String targetUserId;
    private String targetUserName;
    private String details;
    private String ipAddress;
    private LocalDateTime timestamp;
}
```

**4. `AuditLogStatsResponse` (Métricas Resumidas de Auditoria):**
```java
public class AuditLogStatsResponse {
    private long totalLogs;
    private long logsLast24Hours;
    private long documentViewsCount;
    private long dossierReviewsCount;
}
```

---

#### 3.2. Endpoints da Gestão de Usuários (`/api/admin/users`)

| Método | Rota | Descrição | Permissão |
|---|---|---|---|
| `GET` | `/api/admin/users` | Lista usuários com suporte a filtros (`role`, `active`, `search`) | `ROLE_ADMIN` |
| `GET` | `/api/admin/users/{id}` | Retorna o perfil completo de um usuário | `ROLE_ADMIN` |
| `PATCH` | `/api/admin/users/{id}/status` | Altera status de ativação do usuário (`active: true/false`), gravando log em `audit_logs` | `ROLE_ADMIN` |

---

#### 3.3. Endpoints da Trilha de Auditoria (`/api/admin/audit-logs`)

| Método | Rota | Descrição | Permissão |
|---|---|---|---|
| `GET` | `/api/admin/audit-logs` | Consulta os registros de auditoria com filtros (`action`, `userId`, `targetUserId`, `search`) | `ROLE_ADMIN` |
| `GET` | `/api/admin/audit-logs/stats` | Retorna métricas resumidas para os cards de governança do painel | `ROLE_ADMIN` |

---

### 4. Interface com o Usuário (Frontend React 19)

#### 4.1. Tela `AdminUsuarios.tsx` (Rota `/admin/usuarios`)
* Localizada no layout administrativo `AdminLayout`.
* Barra de filtros:
  * Abas por Perfil: `Todos`, `Pacientes (ROLE_PACIENTE)`, `Médicos (ROLE_MEDICO)`, `Administradores (ROLE_ADMIN)`.
  * Filtro de Status: `Todos`, `Apenas Ativos`, `Apenas Inativos`.
  * Campo de busca textual por Nome, E-mail, CPF ou CRM.
* Tabela responsiva exibindo:
  * Nome completo e e-mail;
  * Perfil / Role (com badges semânticas coloridas);
  * CPF / CRM (conforme perfil);
  * Data de cadastro;
  * Status da Conta (Badge Verde `Ativo` ou Vermelha `Inativo`);
  * Botão de ação: Alternar Status (com abertura do modal acessível de confirmação `FeedbackModal.tsx`).

#### 4.2. Tela `AdminAuditoria.tsx` (Rota `/admin/auditoria`)
* Localizada no layout administrativo `AdminLayout`.
* Cards de Resumo: Total de Eventos Registrados, Eventos nas Últimas 24h, Documentos Médicos Visualizados, Decisões de Credenciamento.
* Barra de filtros por Tipo de Ação (`Todas`, `VIEW_DOCUMENT`, `VIEW_DOSSIER`, `REVIEW_DOSSIER_APPROVE`, `REVIEW_DOSSIER_REJECT`, `ACTIVATE_USER`, `DEACTIVATE_USER`, etc.) e campo de busca por usuário ou IP.
* Tabela cronológica dos logs contendo:
  * Data/Hora (pt-BR);
  * Operador (Nome/E-mail + Role);
  * Ação executada (Badge colorida semântica);
  * Usuário Alvo;
  * Endereço IP;
  * Detalhes operacionais.
* Botão para visualização de detalhes completos do log em modal.

---

### 5. Plano de Implementação da Micro Tarefa 2.3

1. **Passo 1 (Backend - DTOs & Repositórios):**
   * Criação dos DTOs de Usuários e Auditoria.
   * Adição de métodos de consulta customizados no `UserRepository` e `AuditLogRepository`.
2. **Passo 2 (Backend - Serviços de Negócio):**
   * Criação do `AdminUserService.java` (listagem, busca, ativação/inativação com trava de auto-bloqueio e gravação em `audit_logs`).
   * Expansão do `AuditService.java` com métodos de consulta filtrada e consolidação de métricas.
3. **Passo 3 (Backend - Controladores RESTful):**
   * Criação do `AdminUserController.java` (`/api/admin/users/**`).
   * Criação do `AdminAuditLogController.java` (`/api/admin/audit-logs/**`).
4. **Passo 4 (Frontend - Gestão de Usuários):**
   * Criação do componente `AdminUsuarios.tsx` com filtros, busca e modais de confirmação.
5. **Passo 5 (Frontend - Trilha de Auditoria):**
   * Criação do componente `AdminAuditoria.tsx` com cards de métricas, tabela e filtros.
6. **Passo 6 (Roteamento & Validação):**
   * Conexão das rotas `/admin/usuarios` e `/admin/auditoria` no `App.tsx`.
   * Validação de compilação sem erros no Maven e Vite.
   * Execução dos testes BDD, commit convencional e push.

---

### 6. Critérios de Aceite da Spec (DoD)

- [ ] Administrador consegue listar todos os usuários com filtros por perfil (`ROLE_PACIENTE`, `ROLE_MEDICO`, `ROLE_ADMIN`) e status (`active`).
- [ ] Administrador consegue inativar a conta de um paciente ou médico, impedindo seu login no sistema.
- [ ] O sistema bloqueia a tentativa de um administrador inativar a si mesmo.
- [ ] Toda inativação ou reativação de usuário gera compulsoriamente um registro em `audit_logs`.
- [ ] A tela de auditoria lista cronologicamente os eventos de `audit_logs` com IP, operador, ação e timestamp.
- [ ] O filtro por tipo de ação na auditoria isola corretamente eventos como `VIEW_DOCUMENT` e `REVIEW_DOSSIER`.
- [ ] Nenhuma rota do módulo de administração pode ser acessada por usuários anônimos, pacientes ou médicos.
