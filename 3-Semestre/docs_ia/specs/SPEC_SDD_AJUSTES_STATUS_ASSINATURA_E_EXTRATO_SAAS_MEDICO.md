# 📄 SPEC-17H — Status de Assinatura Ativa no Painel Médico e Extrato Exclusivo de Faturas SaaS

> **Status:** Proposta Técnica (Aguardando Aprovação / Implementação)  
> **Autor:** Antigravity Pair Programmer Sênior  
> **Data:** 07 de Novembro de 2026  
> **Semestre de Foco:** 4º Semestre (Ajustes de UX e Governança Financeira)  
> **Documentos Relacionados:** SPEC-17B, SPEC-17F, SPEC-17G, `DashboardMedico.tsx`, `ExtratoFinanceiroModal.tsx`, `AssinaturaSaaSModal.tsx`

---

## 1. Contexto & Diagnóstico

Durante a validação prática conduzida pelo Tech Lead & PO (Guilherme Silva), foram identificadas duas necessidades prioritárias:

1. **Persistência de Status de Assinatura Ativa ("Fiz o pagamento e continuo podendo assinar"):**
   - Após efetuar o pagamento da assinatura SaaS no modal, o card no Dashboard do médico continuava com a opção de assinar e abria novamente o modal de checkout.
   - **Solução:**
     - Criar endpoint autenticado perimetral `POST /api/doctor/subscription/activate` no Core, garantindo que o médico logado tenha seu status atualizado para `ASSINATURA_ATIVA` sem depender apenas de ID em URL;
     - Melhorar `InternalCallbackController.java` com fallback por e-mail;
     - No `DashboardMedico.tsx`, quando a assinatura estiver ativa (`isSubscribed`), o card muda seu estado para **"Plano Pro Ativo"** com badge `Ativo` e trava o reingresso no checkout, informando a data da próxima renovação.

2. **Extrato Financeiro do Médico Focado Exclusivamente na Assinatura SaaS ("Não vamos mexer com repasse de honorários no 4º semestre"):**
   - O extrato do médico continha cálculos de repasse de teleconsultas, abas de filtro e balanço líquido.
   - O PO determinou que, no 4º semestre, o extrato do médico deve conter **exclusivamente os comprovantes e faturas da assinatura SaaS mensal (R$ 149,90)** contratada pelo médico.
   - **Solução:**
     - Remover consultas e honorários de telemedicina do `ExtratoFinanceiroModal.tsx`;
     - Redesenhar os cards de métricas em P&B para focar no Plano Contratado, Mensalidade SaaS (R$ 149,90) e Status de Liquidação;
     - Eliminar abas de filtro (já que o escopo é 100% de faturas da assinatura);
     - Manter o padrão P&B puro com isolamento de impressão.

---

## 2. Micro Tarefas Detalhadas

### Micro Tarefa 17H.1 — Blindagem do Status de Assinatura Ativa & Trava de Re-assinatura
1. **Backend (`DoctorScheduleController.java`):**
   - Adicionar endpoint `POST /api/doctor/subscription/activate` com `@PreAuthorize("hasRole('MEDICO')")`, atualizando o status do médico para `DoctorSubscriptionStatus.ASSINATURA_ATIVA` e validade para +30 dias.
2. **Backend (`InternalCallbackController.java`):**
   - Adicionar busca por email no fallback: `userRepository.findById(doctorId).or(() -> userRepository.findByEmail(doctorId))`.
3. **Frontend (`AssinaturaSaaSModal.tsx`):**
   - Ao aprovar o pagamento, acionar tanto `/api/doctor/subscription/activate` quanto o callback, além de gravar `activeage_doctor_subscription_${doctorId}` no `localStorage`.
4. **Frontend (`DashboardMedico.tsx`):**
   - Calcular `isSubscribed` reativamente (`stats?.subscriptionStatus === 'ASSINATURA_ATIVA'` ou `localStorage`);
   - No Card 3, exibir "Plano Pro Ativo" / "Renovação em 30 dias" quando ativo;
   - Ao clicar com plano ativo, abrir mensagem confirmando que a assinatura está regularizada, sem abrir o formulário de pagamento novamente.

### Micro Tarefa 17H.2 — Extrato Exclusivo da Assinatura SaaS em P&B Puro
1. **Frontend (`ExtratoFinanceiroModal.tsx`):**
   - Filtrar e exibir unicamente transações do tipo `ASSINATURA_SAAS_MEDICO`;
   - Remover chamadas a `/api/doctor/appointments` e cálculos de repasse de honorários;
   - Substituir os 3 cards antigos por:
     - Card 1: **Plano Contratado** (Consultório Pro SaaS)
     - Card 2: **Valor da Mensalidade** (R$ 149,90)
     - Card 3: **Status da Licença** (Liquidada / Ativa)
   - Remover abas de filtro ("Todas / Consultas / SaaS");
   - Tabela simplificada e elegante listando o histórico de faturas da assinatura mensal;
   - Manter código oficial `AA-SAAS-2026-XXXXXX` e isolamento para impressão A4.

---

## 3. Critérios de Aceite
1. Após o pagamento da assinatura SaaS no modal, o dashboard do médico exibe imediatamente "Plano Pro Ativo" no card.
2. Clicar no card de assinatura quando ela já está ativa não abre o formulário de checkout para pagar de novo.
3. O Extrato do médico exibe exclusivamente as faturas da assinatura SaaS (R$ 149,90), sem exibir honorários ou repasses de teleconsultas.
4. O extrato permanece 100% no padrão Preto e Branco Puro (P&B) alinhado ao paciente e com impressão isolada.
5. Todos os testes automatizados (backend core, ms-pagamento e build do Vite) passam com 0 erros.
