# 📄 SPEC-17I — Exibição Condicional de Extrato SaaS Apenas Pós-Assinatura & Filtragem Estrita de Faturas Liquidadas

> **Status:** Proposta Técnica (Aguardando Aprovação / Implementação)  
> **Autor:** Antigravity Pair Programmer Sênior  
> **Data:** 07 de Novembro de 2026  
> **Semestre de Foco:** 4º Semestre (Governança Financeira & Qualidade de Relatórios)  
> **Documentos Relacionados:** SPEC-17G, SPEC-17H, `ExtratoFinanceiroModal.tsx`, `DashboardMedico.tsx`, `PagamentoServiceImpl.java`

---

## 1. Contexto & Diagnóstico

Durante os testes de contratação da assinatura do Consultório Virtual Pro pelo Tech Lead & PO (Guilherme Silva), foram identificadas duas anomalias no Extrato Financeiro do Médico:

1. **Exibição de Múltiplas Assinaturas Não Liquidadas:**
   - O extrato estava listando 4 lançamentos de assinatura SaaS, dos quais apenas 1 estava liquidado/aprovado e os demais estavam pendentes (frutos de tentativas anteriores de geração de Pix/Checkout Pro que não foram concluídas).
   - **Causa Raiz:** O backend e o modal carregavam todas as transações sem filtrar pelo status `APROVADO`. Tentativas pendentes ou abandonadas de checkout eram exibidas na tabela contábil.

2. **Geração Indevida de Relatório Antes da Assinatura:**
   - Antes de contratar o plano, o modal já renderizava um relatório timbrado com fallback sintético.
   - O PO determinou explicitamente: **"enquanto não assinar, não gere relatório, só depois que assinei"**.
   - **Causa Raiz:** O modal continha um mock de fallback automático que injetava uma fatura quando o array estava vazio, impedindo o estado vazio (*empty state*) real.

---

## 2. Micro Tarefas Detalhadas

### Micro Tarefa 17I.1 — Filtragem Estrita de Transações Liquidadas (`StatusPagamento.APROVADO`)
1. **Backend (`PagamentoServiceImpl.java`):**
   - No método `buscarPorBeneficiario(doctorId)`, filtrar estritamente transações com `p.getStatus() == StatusPagamento.APROVADO` e `p.getTipo() == TipoPagamento.ASSINATURA_SAAS_MEDICO`.
2. **Frontend (`ExtratoFinanceiroModal.tsx`):**
   - Filtrar apenas pagamentos com `status === 'APROVADO'`.
   - Implementar deduplicação inteligente por competência/dia, garantindo que apenas a fatura liquidada vigente seja listada (eliminando tentativas pendentes anteriores).

### Micro Tarefa 17I.2 — Estado Vazio & Trava de Emissão de Relatório Pré-Assinatura
1. **Remoção do Mock de Fallback Automático:**
   - Eliminar a injeção forçada de faturas sintéticas quando o médico não possui assinatura aprovada.
2. **Empty State Amigável (Não Imprimível):**
   - Caso o médico não tenha contratado o plano (`pagamentos.length === 0`), não gerar o cabeçalho timbrado, tabelas ou relatórios contábeis.
   - Exibir um modal limpo e objetivo:
     - Título: *"Nenhum Comprovante Disponível"*;
     - Mensagem: *"O comprovante fiscal e o extrato financeiro só são gerados após a confirmação e liquidação da assinatura do Consultório Virtual Pro."*;
     - Botão de Ação: *"Assinar Consultório Pro (R$ 149,90/mês)"*, permitindo migrar diretamente para o checkout sem atrito.
3. **Exibição do Relatório Timbrado Exclusivamente Pós-Liquidação:**
   - Somente após a assinatura ser liquidada com sucesso o relatório oficial P&B com o código `AA-SAAS-2026-XXXXXX` e opção de impressão/salvar PDF será disponibilizado.

---

## 3. Critérios de Aceite
1. O extrato financeiro do médico exibe **apenas faturas liquidadas (`APROVADO`)**, sem listar checkouts pendentes ou incompletos.
2. Se o médico não tiver efetuado a assinatura, **nenhum relatório ou documento timbrado é gerado**, exibindo o estado informativo com botão para assinar.
3. Ao assinar e liquidar o pagamento, o extrato exibe exatamente a fatura liquidada correspondente (R$ 149,90), em layout P&B oficial.
4. Todos os testes unitários e de integração permanecem 100% aprovados, e o build do Vite executa sem erros.
