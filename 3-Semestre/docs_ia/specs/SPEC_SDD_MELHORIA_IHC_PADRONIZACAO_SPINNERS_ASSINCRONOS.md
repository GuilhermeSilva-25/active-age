# 📋 ESPECIFICAÇÃO TÉCNICA (SPEC): PADRONIZAÇÃO UNIVERSAL DE SPINNERS EM BOTÕES ASSÍNCRONOS

> **Código da Spec:** SPEC-05B  
> **Projeto:** Active Age — Plataforma Integral de Telessaúde Geriátrica  
> **Módulo:** Interface Humano-Computador (IHC) & Acessibilidade Visual Universal  
> **Casos de Uso Relacionados:** UC01 (Cadastrar-se), UC02 (Autenticar-se / Logout), UC03 (Credenciamento), UC04/UC05 (Painel Administrativo)  
> **Requisitos Funcionais / Regras de Negócio:** RNF001, RNF002, RNF004 (Acessibilidade e Feedback Imediato)  
> **Normas de Referência Ética & Regulatória:** Diretrizes W3C/WCAG 2.1 AA (Critérios 4.1.3 Status Messages e 2.2.1 Timing Adjustable), Heurísticas de Usabilidade de Nielsen  
> **Data:** 28 de Outubro de 2026  
> **Status:** CONCLUÍDA E HOMOLOGADA EM PRODUÇÃO ✅  
> **Metodologia:** Spec-Driven Development (SDD)

---

### 1. Contexto e Diagnóstico de IHC

Em aplicações de telessaúde com foco geriátrico como o **Active Age**, a previsibilidade e a clareza do feedback visual são imperativos de usabilidade:
1. **Evitar Cliques Múltiplos (Double-Click Prevenção):** A ausência de feedback imediato de carregamento leva usuários idosos e médicos a clicarem repetidamente em botões de submissão (login, cadastro, logout), gerando requisições duplicadas ou concorrência desnecessária no backend.
2. **Consistência Visual (Heurística de Nielsen #4):** O sistema deve manter coerência. Enquanto algumas ações (como a verificação assíncrona de e-mail na Etapa 1 e o upload do dossiê) já utilizavam o ícone `Loader2` animado, os botões finais de submissão do Login, Cadastro de Paciente, Cadastro de Médico e os botões de Logout apenas alteravam o texto estático ou não ofereciam feedback visual animado.

---

### 2. Inventário de Componentes & Botões Assíncronos

| Componente / Página | Ação Assíncrona | Estado Atual | Solução Proposta com Padronização |
|---|---|---|---|
| [`Login.tsx`](../../frontend-react/src/pages/auth/Login.tsx) | `POST /api/auth/login` | Exibe apenas texto *"Verificando segurança..."* | Incluir `<Loader2 className="w-5 h-5 animate-spin" />` + texto *"Entrando na plataforma..."* |
| [`CadastroPaciente.tsx`](../../frontend-react/src/pages/auth/CadastroPaciente.tsx) | `POST /api/auth/register-patient` | Exibe apenas texto *"Criando Conta..."* na Etapa 3 | Incluir `<Loader2 className="w-5 h-5 animate-spin" />` + texto *"Criando Conta..."* |
| [`CadastroMedico.tsx`](../../frontend-react/src/pages/auth/CadastroMedico.tsx) | `POST /api/auth/register-doctor` | Exibe apenas texto *"Registrando..."* na Etapa 3 | Incluir `<Loader2 className="w-5 h-5 animate-spin" />` + texto *"Registrando..."* |
| [`RecuperarSenha.tsx`](../../frontend-react/src/pages/auth/RecuperarSenha.tsx) | Envio de e-mail de recuperação | Exibe apenas texto *"Processando..."* | Incluir `<Loader2 className="w-5 h-5 animate-spin" />` + texto *"Enviando link..."* |
| [`Navbar.tsx`](../../frontend-react/src/components/home/Navbar.tsx) | `POST /api/auth/logout` | Sem estado de loading (texto fixo *"Sair"*) | Adicionar estado `isLoggingOut` + `<Loader2 className="w-4 h-4 animate-spin" />` |
| [`DashboardPaciente.tsx`](../../frontend-react/src/pages/paciente/DashboardPaciente.tsx) | `POST /api/auth/logout` | Sem estado de loading (texto fixo *"Sair"*) | Adicionar estado `isLoggingOut` + `<Loader2 className="w-4 h-4 animate-spin" />` |
| [`DashboardMedico.tsx`](../../frontend-react/src/pages/medico/DashboardMedico.tsx) | `POST /api/auth/logout` | Sem estado de loading (texto fixo *"Sair"*) | Adicionar estado `isLoggingOut` + `<Loader2 className="w-4 h-4 animate-spin" />` |
| [`DossieCredenciamento.tsx`](../../frontend-react/src/pages/medico/DossieCredenciamento.tsx) | `POST /api/auth/logout` | Sem estado de loading (texto fixo *"Sair"*) | Adicionar estado `isLoggingOut` + `<Loader2 className="w-4 h-4 animate-spin" />` |
| [`AdminLayout.tsx`](../../frontend-react/src/layouts/AdminLayout.tsx) | `POST /api/auth/logout` | Sem estado de loading no botão do menu | Adicionar estado `isLoggingOut` + `<Loader2 className="w-4 h-4 animate-spin" />` |

*(Observação: Os botões de upload e submissão do Dossiê, moderação de usuários e modais de auditoria administrativa já possuem o spinner implementado e serão mantidos como referência de padrão).*

---

### 3. Padrão Arquitetural de Feedback Visual (IHC / Design System)

1. **Ícone Padronizado:** Uso exclusivo do ícone `Loader2` da biblioteca `lucide-react` com animação Tailwind `animate-spin`.
2. **Dimensionamento Proporcional:**
   - Botões principais de formulário (`btn-primary` com padding `py-3.5` ou `py-4`): `w-5 h-5`.
   - Botões compactos de navegação / cabeçalho (como *"Sair"*): `w-4 h-4`.
3. **Bloqueio de Interação Concorrente:**
   - Aplicação de `disabled={isSubmitting || isLoggingOut}` e classe `disabled:opacity-70 disabled:cursor-not-allowed`.
   - Remoção temporária de ícones de navegação secundários (como `<ArrowRight />` ou `<LogOut />`) enquanto o spinner estiver ativo para evitar poluição visual.

---

### 4. Micro Tarefas de Implementação

- **Micro Tarefa 1 (Formulários de Autenticação & Acesso):**
  - Atualizar `Login.tsx` com `Loader2` no botão de submissão.
  - Atualizar `CadastroPaciente.tsx` com `Loader2` na Etapa 3.
  - Atualizar `CadastroMedico.tsx` com `Loader2` na Etapa 3.
  - Atualizar `RecuperarSenha.tsx` com `Loader2` na submissão.
- **Micro Tarefa 2 (Ações de Encerramento de Sessão / Logout):**
  - Criar estado `isLoggingOut` e spinner no botão *"Sair"* em `Navbar.tsx` (desktop e mobile).
  - Implementar estado `isLoggingOut` e spinner em `DashboardPaciente.tsx`.
  - Implementar estado `isLoggingOut` e spinner em `DashboardMedico.tsx`.
  - Implementar estado `isLoggingOut` e spinner em `DossieCredenciamento.tsx`.
  - Implementar estado `isLoggingOut` e spinner em `AdminLayout.tsx`.
- **Micro Tarefa 3 (Validação e Homologação):**
  - Checagem estática de tipagem TypeScript e testes de renderização.

---

### 5. Critérios de Aceite Validados

- [x] Todos os botões de envio de formulários assíncronos exibem o ícone `Loader2 animate-spin` enquanto a promessa HTTP estiver pendente.
- [x] O botão *"Sair"* (logout) em todas as telas (Navbar pública, Painel do Paciente, Painel do Médico, Dossiê e Admin) exibe spinner e desabilita cliques repetidos.
- [x] O layout e alinhamento visual dos botões permanecem estáveis (sem saltos de layout ou quebras de texto) durante a transição para o estado de carregamento.
