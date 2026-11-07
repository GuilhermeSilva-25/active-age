# 📋 ESPECIFICAÇÃO TÉCNICA (SPEC-17B — SDD)
## Ecossistema Integral de Pagamentos: 3 Opções de Checkout, Contas de Teste Mercado Pago, Extrato Financeiro & Trilha de Auditoria
### Faculdade de Tecnologia de Diadema (Fatec) — DSM 4º Semestre
**Tech Lead & Product Owner:** Guilherme Silva  
**Pair Programmer:** Antigravity  
**Status:** Proposta para Aprovação Formal (Zero Código Sem Spec) ⏳  
**Data:** 07 de Novembro de 2026  

---

### 1. Contexto e Motivação
A implementação da fundação do microsserviço de pagamento (`ms-pagamento-faturamento`) consolidou a liquidação via Pix (QR Code oficial e Copia e Cola) e as estratégias OCP de Split Direto 100% Médico. Contudo, para que a experiência de homologação e de uso real seja completa, torna-se necessário:
1. **Permitir pagamento funcional usando Contas de Teste do Mercado Pago:** O ambiente Sandbox do Mercado Pago só permite que transações de teste sejam pagas e liquidadas por compradores fictícios se a cobrança for realizada através do **Checkout Pro (Link Direto / Redirect)** ou se o usuário logar com uma **Conta de Teste Compradora** (com saldo de testes de R$ 5.000 e cartões de teste atribuídos).
2. **Unificar 3 Opções de Pagamento (tanto para o Paciente quanto para o Médico):**
   - **Opção 1 — Pix Instantâneo:** QR Code dinâmico e código Copia e Cola gerados diretamente na API;
   - **Opção 2 — Cartão de Crédito Transparente:** Formulário na aplicação com alvos táteis ampliados para idosos (WCAG/IHC);
   - **Opção 3 — Pagar via Mercado Pago (Checkout Pro / Conta Teste):** Redirecionamento oficial para o `sandbox_init_point` / `init_point`, onde o usuário pode logar com sua conta teste do Mercado Pago ou usar qualquer meio do ecossistema MP.
3. **Persistência Completa de Dados Transacionais:** Captura de ID da transação, bandeira, método, data de autorização e comprovante.
4. **Módulo de Extrato Financeiro & Comprovante Timbrado:**
   - **Para o Paciente:** Emissão de **Comprovante de Pagamento de Teleconsulta** (recibo médico com CRM, valor e autenticação);
   - **Para o Médico:** **Extrato Financeiro de Consultório** com histórico de consultas recebidas (100% médico) e histórico de mensalidades SaaS de R$ 149,90.
5. **Auditoria Perimetral no Painel do Administrador (`audit_logs`):** Registro de criação, confirmação e cancelamento com sigilo LGPD.

---

### 2. Matriz de Conformidade Regulatória (CFM, SBIS & LGPD)

| Regulamentação / Lei | Dispositivo Legal | Aplicação no Active Age | Status |
| :--- | :--- | :--- | :--- |
| **Res. CFM nº 2.314/2022** | Art. 8º e Art. 9º (Honorários) | Honorários de teleconsulta previamente acordados e exibidos de forma clara ao idoso antes do agendamento. | Conforme ✅ |
| **Código de Ética Médica (CEM)** | Art. 65 (Vedação à Dicotomia) | **Proibição absoluta de comissões percentuais** da plataforma sobre a consulta do médico. Split Direto de 100% dos honorários para o profissional. | Conforme ✅ |
| **Res. CFM nº 2.336/2023** | Art. 4º (Publicidade Médica) | Recibos e extratos estritamente descritivos e éticos, sem ranking comercial, premiações ou mercantilização. | Conforme ✅ |
| **LGPD (Lei nº 13.709/2018)** | Art. 11 (Dados Sensíveis de Saúde) | **Sigilo Clínico Absoluto:** Nenhum dado de prontuário, sintomas, anamnese ou CID-11 é enviado ao Mercado Pago ou registrado nos logs contábeis. | Conforme ✅ |
| **Padrão SBIS NGS1/NGS2** | Rastreabilidade e Integridade | Comprovante de pagamento dotado de código de autenticação único vinculando a fatura à teleconsulta. | Conforme ✅ |

---

### 3. Arquitetura das 3 Opções de Pagamento

```mermaid
flowchart TD
    subgraph Frontend Active Age (React 19)
        Modal[Modal de Checkout: Consulta ou SaaS]
        Tab1[Opção 1: Pix Instantâneo]
        Tab2[Opção 2: Cartão de Crédito Transparente]
        Tab3[Opção 3: Mercado Pago Checkout Pro]
    end

    subgraph ms-pagamento-faturamento (Spring Boot / Java 21)
        PayService[IPagamentoService]
        MPGateway[MercadoPagoGatewayImpl]
        DB[(H2 Database / tb_pagamentos)]
    end

    subgraph Mercado Pago Oficial
        PixAPI["API v1/payments (Pix)"]
        CardAPI["API v1/payments (Card)"]
        PrefAPI["API /checkout/preferences (Checkout Pro)"]
        HostedCheckout["Mercado Pago Hosted (sandbox_init_point)"]
    end

    Modal --> Tab1
    Modal --> Tab2
    Modal --> Tab3

    Tab1 -->|POST /api/v1/pagamentos/consulta| PayService
    Tab2 -->|POST /api/v1/pagamentos/consulta| PayService
    Tab3 -->|POST /api/v1/pagamentos/preferencia| PayService

    PayService --> MPGateway
    MPGateway --> PixAPI
    MPGateway --> CardAPI
    MPGateway --> PrefAPI

    PrefAPI -->|Retorna sandbox_init_point| Tab3
    Tab3 -->|Redireciona / Abre Nova Aba| HostedCheckout
    HostedCheckout -->|Login com Conta Teste / Saldo Fake| Webhook[Webhook MP / Notification]
    Webhook --> PayService
    PayService --> DB
```

---

### 4. Como Funciona o Pagamento com Conta de Teste do Mercado Pago

1. **Criação da Conta de Teste no Painel do Mercado Pago:**
   * No menu da aplicação do Mercado Pago, em **Contas de teste**, cria-se uma conta compradora (ex: `test_user_xxxx@testuser.com`);
   * O Mercado Pago gera essa conta automaticamente com um saldo fictício (ex: R$ 5.000,00) e cartões de crédito de teste aprovados.
2. **Execução no Active Age via Opção 3 (Checkout Pro):**
   * O usuário seleciona **"Pagar via Mercado Pago"** e clica no botão;
   * O backend cria uma preferência no endpoint oficial `/checkout/preferences` e obtém a URL `sandbox_init_point`;
   * O navegador abre a página oficial do Mercado Pago Sandbox;
   * O usuário insere o login e senha da sua **Conta de Teste de Comprador**;
   * Seleciona pagar com saldo em conta ou cartão teste e clica em **Pagar**;
   * O Mercado Pago processa, aprova a transação de teste e despacha o webhook para a nossa esteira, confirmando a teleconsulta ou a assinatura SaaS em tempo real!

---

### 5. Extrato Financeiro & Comprovante de Pagamento

#### 5.1. Comprovante do Paciente (Recibo de Teleconsulta)
* Acessível em "Minhas Consultas" nas consultas confirmadas / realizadas;
* Exibição em modal acessível e opção de impressão em modelo P&B / PDF timbrado;
* Campos obrigatórios (Res. CFM nº 2.314/2022):
  * **Identificação:** Nome do Idoso, CPF mascarado;
  * **Prestador:** Dr(a). Nome do Médico, CRM, UF, Especialidade;
  * **Transação:** ID da Transação Mercado Pago (`mpPaymentId`), Data/Hora de Liquidação, Valor Total (R$ 250,00);
  * **Método:** Pix, Cartão de Crédito ou Saldo Mercado Pago;
  * **Autenticação:** Código alfanumérico seguro `AA-REC-2026-XXXXXX` para comprovação perante convênios ou Receita Federal (Imposto de Renda).

#### 5.2. Extrato Financeiro do Consultório Médico
* Acessível no Dashboard do Médico (nova aba ou modal dedicado "Extrato & Faturamento");
* Listagem consolidada:
  1. **Recebimentos de Consultas:** Cada atendimento com split 100% creditado (R$ 250,00);
  2. **Pagamentos de Assinatura SaaS:** Mensalidades de R$ 149,90 pagas à Active Age com status ativo e validade;
* Resumo com: Total Recebido em Consultas, Total Pago em SaaS e Saldo Líquido do Consultório.

---

### 6. Registro de Auditoria Perimetral no Backend Core (`audit_logs`)

Sempre que uma transação ocorrer, o `ms-pagamento-faturamento` notificará o `backend-core` via callback seguro, registrando no `audit_logs`:
* `PAYMENT_INTENT_CREATED`: Intenção registrada com ID e valor;
* `PAYMENT_CONFIRMED`: Pagamento aprovado via Pix, Cartão ou Checkout Pro;
* `PAYMENT_CANCELLED_EXPIRED`: Consulta cancelada após 15 min sem pagamento com reciclagem do slot;
* `SUBSCRIPTION_ACTIVATED`: Ativação de 30 dias de SaaS para o médico.

O Administrador tem visualização direta em tempo real no Dashboard com filtros de auditoria e métricas.

---

### 7. Divisão em Micro Tarefas Testáveis

- [ ] **Micro Tarefa 17B.1 — Integração de Checkout Pro no Gateway (`MercadoPagoGatewayImpl`):**
  - Implementar chamada oficial a `POST https://api.mercadopago.com/checkout/preferences` com retorno de `sandbox_init_point` e `init_point`;
  - Endpoint REST no microsserviço: `POST /api/v1/pagamentos/preferencia` gerando preferência com `external_reference` e `back_urls`.
- [ ] **Micro Tarefa 17B.2 — As 3 Opções de Pagamento no Modal da Consulta do Paciente (`AgendarConsultaModal.tsx`):**
  - Tabs dinâmicas: Pix (1), Cartão de Crédito (2) e Pagar via Mercado Pago (3);
  - Na Opção 3, botão com logo oficial do Mercado Pago que redireciona/abre `sandbox_init_point` para pagamento via Conta Teste.
- [ ] **Micro Tarefa 17B.3 — As 3 Opções de Pagamento no Modal de Assinatura SaaS do Médico (`AssinaturaSaaSModal.tsx`):**
  - Opções: Pix (1), Cartão de Crédito (2) e Pagar via Mercado Pago (3);
  - Redirecionamento para a preferência de R$ 149,90 no Sandbox do Mercado Pago.
- [ ] **Micro Tarefa 17B.4 — Geração do Comprovante de Pagamento do Paciente & Extrato Financeiro do Médico:**
  - Componente acessível `ComprovantePagamentoModal.tsx` no paciente com layout timbrado;
  - Seção de Extrato Financeiro de Consultório em `DashboardMedico.tsx` com histórico e totais.
- [ ] **Micro Tarefa 17B.5 — Auditoria Global e Testes Automatizados Integrados:**
  - Envio de eventos contábeis para `audit_logs` no `InternalCallbackController.java`;
  - Expansão dos testes unitários e de integração MockMvc para cobrir preferências e comprovantes (meta: 0 falhas).

---

### 8. Critérios de Aceite da Spec
1. O paciente e o médico conseguem pagar a consulta ou a assinatura usando uma Conta de Teste do Mercado Pago via Checkout Pro (`sandbox_init_point`);
2. Ambas as telas possuem as 3 opções de pagamento (Pix, Cartão e Mercado Pago Direto);
3. O comprovante de pagamento da teleconsulta pode ser visualizado e impresso pelo paciente com CRM do médico e autenticação;
4. O médico possui visão de extrato financeiro das suas consultas e de suas faturas SaaS;
5. Todas as transações são registradas na trilha de auditoria do Admin (`audit_logs`) sem violar o sigilo médico LGPD;
6. Todos os testes automatizados (Core + Pagamento) passam com 100% de sucesso.
