# SPEC-11H — Reorganização de UX dos Dashboards com Priorização Visual de Consultas Agendadas

- **Autor:** Guilherme Silva (PO & Tech Lead) & Antigravity (AI Pair Programmer)
- **Data de Aprovação:** 02 de Novembro de 2026
- **Status:** APROVADO / IMPLEMENTADO
- **Módulo:** `frontend-react` (`DashboardPaciente.tsx`, `DashboardMedico.tsx`)
- **Conformidade:** WCAG 2.1 AA / Heurísticas de Nielsen / Resoluções CFM nº 2.314/2022 e 2.336/2023

---

## 1. Visão Geral & Motivação (UX & Acessibilidade Geriátrica)
A telemedicina geriátrica exige interfaces de alta clareza cognitiva, minimização de esforço motor e rápida orientação espacial.

1. **Dashboard do Paciente (`DashboardPaciente.tsx`):**
   - **Problema anterior:** A seção "Próxima Consulta Agendada" estava posicionada abaixo dos quatro cards de ações rápidas ("O que você deseja fazer hoje?"), obrigando o idoso ou cuidador a rolar a página verticalmente para encontrar o link de acesso à teleconsulta.
   - **Solução SPEC-11H:** Reposicionar a seção de consultas no topo da página, imediatamente após a saudação de boas-vindas. Assim que o idoso entra, ele visualiza imediatamente se há consulta confirmada, horário de Brasília e o botão tátil ampliado "Entrar na Sala Virtual".

2. **Dashboard do Médico (`DashboardMedico.tsx`):**
   - **Problema anterior:** A lista de atendimentos do dia ("Pacientes Agendados Hoje") ficava no rodapé da página, abaixo do grid de ferramentas do consultório virtual.
   - **Solução SPEC-11H:** Quando houver consultas agendadas para a data atual (`todayAppointments.length > 0`), a seção de pacientes agendados é promovida para o topo, logo após o grid de métricas do consultório e antes das ferramentas gerais. Quando não houver consultas (`todayAppointments.length === 0`), as ferramentas permanecem no topo para incentivar a abertura e configuração da agenda médica.

---

## 2. Detalhamento Arquitetural das Telas

### 2.1. Estrutura Visual do Paciente (`DashboardPaciente.tsx`)
```text
┌────────────────────────────────────────────────────────┐
│ Header (Active Age, Nome do Paciente, Avatar, Sair)   │
├────────────────────────────────────────────────────────┤
│ Card de Boas-Vindas & Data Oficial de Brasília         │
├────────────────────────────────────────────────────────┤
│ [NOVO] ⭐ Próxima Consulta Agendada                    │
│ - Se confirmada: Card verde destacado + Botão da Sala  │
│ - Se vazia: Empty state com atalho "Buscar Médico"     │
├────────────────────────────────────────────────────────┤
│ Grid de Ações Rápidas (4 cards táteis ampliados)       │
│ - Agendar Consulta Geriátrica                          │
│ - Minhas Consultas & Horários                          │
│ - Meu Cofre de Saúde & Exames                          │
│ - Minhas Receitas & Atestados                          │
├────────────────────────────────────────────────────────┤
│ Dica Dinâmica de Longevidade Ativa & Bem-Estar         │
└────────────────────────────────────────────────────────┘
```

### 2.2. Estrutura Visual do Médico (`DashboardMedico.tsx`)
```text
Cenário A: Com Consultas Hoje (todayAppointments.length > 0)
┌────────────────────────────────────────────────────────┐
│ Header (Dr., CRM, Avatar, Sair)                        │
├────────────────────────────────────────────────────────┤
│ Banner Regulatório CFM / Dossiê (se aplicável)         │
├────────────────────────────────────────────────────────┤
│ Grid de 4 Métricas do Consultório                      │
├────────────────────────────────────────────────────────┤
│ [PROMOVIDO] ⭐ Pacientes Agendados Hoje (Fila Ativa)   │
│ - Horário, Nome do Idoso, Queixa e "Abrir Sala"        │
├────────────────────────────────────────────────────────┤
│ Ferramentas do Consultório (Agenda, Sala, Prontuário)  │
└────────────────────────────────────────────────────────┘

Cenário B: Sem Consultas Hoje (todayAppointments.length === 0)
┌────────────────────────────────────────────────────────┐
│ Grid de 4 Métricas do Consultório                      │
├────────────────────────────────────────────────────────┤
│ Ferramentas do Consultório (Foco em Configurar Agenda) │
├────────────────────────────────────────────────────────┤
│ Pacientes Agendados Hoje (Empty State Informativo)     │
└────────────────────────────────────────────────────────┘
```

---

## 3. Critérios de Aceite BDD

### BDD-01: Exibição Imediata de Consulta Confirmada para o Idoso
- **Dado** que o paciente de teste (`paciente@teste.com`) efetua login,
- **Quando** o `DashboardPaciente` for carregado,
- **Então** o card da consulta de hoje com o médico geriatra deve aparecer imediatamente abaixo da saudação, acima de "O que você deseja fazer hoje?".

### BDD-02: Fila de Teleconsultas Priorizada no Dashboard Médico
- **Dado** que o médico de teste (`medico@teste.com`) efetua login e possui consultas ativas para hoje,
- **Quando** o `DashboardMedico` for carregado,
- **Então** o container de "Pacientes Agendados Hoje" deve ser renderizado antes de "Ferramentas do Consultório Virtual".

### BDD-03: Empty State Mantido no Rodapé quando Médico Não Tiver Consultas
- **Dado** que um médico homologado sem atendimentos no dia efetua login,
- **Quando** o `DashboardMedico` for carregado,
- **Então** "Ferramentas do Consultório Virtual" deve ser renderizada primeiro, com o aviso de ausência de pacientes posicionado abaixo.

---

## 4. Registro de Auditoria e Commits
- Commit: `feat(ux): prioriza consultas agendadas no topo dos dashboards (spec-11h)`
