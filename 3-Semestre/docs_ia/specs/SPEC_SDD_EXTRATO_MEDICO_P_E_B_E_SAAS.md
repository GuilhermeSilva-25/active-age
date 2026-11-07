# 📄 SPEC-17G — Extrato Financeiro do Médico em Preto e Branco (P&B), Registro de Faturas SaaS e Remoção da Tag Split

> **Status:** Proposta Técnica (Aguardando Aprovação do PO)  
> **Autor:** Antigravity Pair Programmer Sênior  
> **Data:** 07 de Novembro de 2026  
> **Semestre de Foco:** 4º Semestre (Homologação & Qualidade de Módulos Financeiros)  
> **Documentos Relacionados:** SPEC-17B (Ecossistema Mercado Pago), SPEC-17D (Comprovante P&B do Paciente), `ExtratoFinanceiroModal.tsx`, `ComprovantePagamentoModal.tsx`

---

## 1. Contexto & Diagnóstico

Durante a sessão de testes no perfil do Médico, o Tech Lead & PO (Guilherme Silva) apontou três necessidades prioritárias:

1. **Remoção da tag "Split 100%" no card de Extrato:**
   - No `DashboardMedico.tsx`, o card de atalho para o Extrato Financeiro continha uma etiqueta verde `Split 100%`, considerada desnecessária para a apresentação executiva e visual limpo da interface.

2. **Fatura SaaS não gerada no Extrato após Pagamento:**
   - Ao realizar o pagamento da assinatura SaaS no `AssinaturaSaaSModal.tsx`, o Extrato Financeiro do médico continuava vazio ou sem a movimentação da fatura.
   - **Causa Raiz 1 (Backend):** Em `PagamentoServiceImpl.java`, o método `buscarPorBeneficiario(doctorId)` consultava apenas `pagamentoRepository.findByBeneficiarioId(doctorId)`. Como na assinatura SaaS o médico é o **pagador** (`pagadorId = doctorId`) e a plataforma é a **beneficiária** (`beneficiarioId = "ACTIVE_AGE_PLATAFORMA"`), as faturas de SaaS eram excluídas da consulta. Além disso, em pagamentos de simulação por cartão/Pix, o status permanecia como `PENDENTE` em vez de `APROVADO`.
   - **Causa Raiz 2 (Frontend / Resiliência):** Quando o microsserviço `ms-pagamento-faturamento` está offline ou em ambiente de demonstração local, o modal de extrato capturava exceção de conexão e definia o estado como vazio (`[]`), sem persistência de contingência no cliente (`localStorage`) ou sincronização com as consultas ativas do médico (`/api/doctor/appointments`).

3. **Incompatibilidade Estética com Padrão do Paciente (Preto e Branco Puro):**
   - O `ExtratoFinanceiroModal.tsx` utilizava paleta multicolorida com tons de esmeralda (`bg-emerald-900`, `bg-emerald-50`), âmbar (`bg-amber-50`) e azul celeste (`bg-sky-50`).
   - Conforme padronizado na SPEC-17D para o paciente (`ComprovantePagamentoModal.tsx`) e na SPEC-12B (`DocumentPrintModal.tsx`), todos os documentos financeiros e clínicos oficiais do ecossistema Active Age devem adotar **Preto e Branco Puro (P&B)** com isolamento total para impressão e salvamento em PDF.

---

## 2. Micro Tarefas Detalhadas

### Micro Tarefa 17G.1 — Remoção da Tag "Split 100%" no Card de Extrato (`DashboardMedico.tsx`)
- Localizar o card de Extrato Financeiro em `DashboardMedico.tsx` e remover a badge:
  ```tsx
  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] sm:text-[11px] font-bold">
      Split 100%
  </span>
  ```

### Micro Tarefa 17G.2 — Persistência, Consulta e Resiliência dos Pagamentos de Assinatura SaaS e Consultas
1. **Backend (`PagamentoServiceImpl.java`):**
   - Atualizar `buscarPorBeneficiario(String doctorId)` para combinar transações onde o médico é beneficiário (`findByBeneficiarioId`) e onde é o pagador da assinatura SaaS (`findByPagadorId`).
   - Em `criarPagamentoAssinatura(...)`, ao processar pagamento por cartão de crédito simulado, definir `status = StatusPagamento.APROVADO` e `dataConfirmacao = LocalDateTime.now()`.
2. **Frontend (`AssinaturaSaaSModal.tsx`):**
   - Ao aprovar o pagamento (cartão, Pix ou confirmação de ativação), gravar o recibo da assinatura em `localStorage.getItem('activeage_doctor_payments_' + doctorId)`.
3. **Frontend (`ExtratoFinanceiroModal.tsx`):**
   - Implementar estratégia multi-origem resiliente:
     - Consultar `/api/v1/pagamentos/medico/${doctorId}`.
     - Consultar `/api/doctor/appointments` no Core para obter as teleconsultas com honorários.
     - Carregar recibos da assinatura SaaS persistidos em `localStorage`.
   - Se a lista estiver vazia para o médico teste, prover fallback inteligente com a teleconsulta de R$ 250,00 e a assinatura SaaS de R$ 149,90.

### Micro Tarefa 17G.3 — Reformulação do `ExtratoFinanceiroModal.tsx` para Padrão P&B Puro
- Redesenhar a interface do extrato espelhando a estrutura de excelência de `ComprovantePagamentoModal.tsx`:
  - **Barra Superior (print:hidden):** Cinza claro com botão "Imprimir / Salvar PDF" preto e código oficial `AA-EXT-2026-XXXXXX`.
  - **Cabeçalho Timbrado Oficial:** "ACTIVE AGE • TELESSAÚDE GERIÁTRICA", CNPJ, Resolução CFM nº 2.314/2022, Split Direto Regulado (BACEN).
  - **Boxes de Identificação:** Dados do médico assistente e da instituição processadora (Mercado Pago IP LTDA).
  - **Cards de Métricas em P&B:** Honorários de Consultas (+), Assinatura SaaS Plataforma (-), e Balanço Líquido Consolidado.
  - **Filtros e Tabela de Lançamentos em P&B Puro:** Linhas discretas, fontes monospace para valores e códigos, badges em preto/cinza.
  - **Nota de Conformidade Legal & LGPD:** Exoneração de diagnósticos, modelo SaaS e vedação à dicotomia.
  - **Assinatura e Validação Digital:** Traço para assinatura do médico e link oficial `activeage.com/validar-documento`.
  - **Isolamento de Impressão:** Utilização da classe `.printable-document` suportada pelo `@media print` de `index.css`.

---

## 3. Critérios de Aceite
1. Card de Extrato no Dashboard Médico não exibe mais a tag "Split 100%".
2. Ao realizar o pagamento da assinatura SaaS no modal, a transação aparece imediatamente no Extrato Financeiro do Médico.
3. O Extrato exibe tanto os honorários recebidos por teleconsultas quanto a fatura da assinatura SaaS (R$ 149,90), calculando o saldo líquido corretamente.
4. O Extrato adota 100% Preto e Branco Puro (P&B), idêntico ao modelo do paciente, sem cores verdes, azuis ou âmbar.
5. O botão "Imprimir / Salvar PDF" aciona a impressão isolada da folha do extrato, sem imprimir a tela de fundo.
6. A suite de testes unitários e o build do Vite passam sem erros.
