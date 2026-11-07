# 📄 SPEC-17F — Refinamentos de UX do Painel Médico, Central de Prontuários e Checkout SaaS

> **Status:** Concluído ✅  
> **Autor:** Antigravity Pair Programmer Sênior  
> **Data:** 07 de Novembro de 2026  
> **Semestre de Foco:** 4º Semestre (Homologação & Qualidade)  
> **Documentos Relacionados:** SPEC-14 (Central de Prontuários), SPEC-17B (Ecossistema Pagamentos), SPEC-17E (Ajustes Checkout), `DashboardMedico.tsx`, `MinhaAgenda.tsx`, `AssinaturaSaaSModal.tsx`, `DoctorRecordsManagerModal.tsx`

---

## 1. Contexto & Diagnóstico dos 10 Apontamentos

Durante a homologação detalhada do portal do Médico conduzida pelo PO (Guilherme Silva), foram identificadas oportunidades essenciais de melhoria visual, usabilidade e conformidade funcional:

1. **Nome do Médico de Teste:** O sufixo `"(Médico Teste)"` deve ser removido, passando a exibir o nome humanizado `"Dr. Marcos Silveira"`.
2. **Minha Agenda (Excesso de Cores):** Os slots de horários possuíam contrastes exagerados (verde esmeralda, azul vivo e cinza opaco). Devem ser padronizados em cards limpos e elegantes com tipografia neutra e badges discretos.
3. **Card Redundante de Sala de Teleconsulta:** O card de ferramentas no Dashboard Médico ("Ação 2: Sala de Teleconsulta") é desnecessário e deve ser removido, pois o médico ingressa na sala diretamente através do botão do paciente agendado na fila do dia.
4. **Central de Prontuários (Trava de Acesso e Separação Documental):**
   - Consultas que ainda não foram concluídas (`AGENDADA`) não devem permitir acesso a prontuários inexistentes; os botões devem ficar desabilitados e apenas habilitar após a consulta ser `REALIZADA`.
   - No modal de visualização de prontuário (`MedicalRecordViewModal.tsx`), o Prontuário Clínico Principal deve ser claramente separado dos demais documentos gerados (Receitas, Atestados e Pedidos de Exames).
5. **Título do Card de Prontuários:** Retirar `"ICP-Brasil"` do título do card em `DashboardMedico.tsx`, tornando-o `"Prontuários & Prescrições"`.
6. **Card de Avaliação Médica:** Remover o Card 4 (avaliação de estrelas) para total adequação à Resolução CFM nº 2.336/2023, reorganizando o grid superior em 3 cards proporcionais.
7. **Cronômetro Regressivo Funcional da Assinatura:** Implementar um cronômetro regressivo em tempo real (`DDd HHh MMm SSs`), atualizado a cada segundo, indicando o tempo restante da degustação ou assinatura SaaS.
8. **Simplificação de Benefícios do Plano SaaS:** Eliminar siglas técnicas e termos regulatórios prolixos (WebRTC, P2P, SHA-256, ICP-Brasil, Res. CFM), tornando os benefícios objetivos.
9. **Modal de Assinatura SaaS em Duas Etapas:**
   - **Etapa 1:** Apresentação do plano e valor mensal (R$ 149,90);
   - **Etapa 2:** Tela de pagamento idêntica à do paciente, com 3 abas funcionais (Pix com QR Code/Copia e Cola, Cartão de Crédito transparente com formulário completo e Mercado Pago Checkout Pro).
10. **Navegação de Retorno no SaaS:** Adicionar o botão `← Voltar para o Plano` na Etapa 2 para permitir ao médico alternar ou revisar antes de pagar.

---

## 2. Detalhamento Arquitetural das Micro Tarefas

### MT 17F.1 — Normalização do Nome do Médico no Backend & Seeding
- Arquivos: `DataInitializer.java`, `DoctorScheduleAutomationService.java`, `DoctorScheduleAutomationServiceTest.java`.
- Ação: Alterar `"Dr. Marcos Silveira (Médico Teste)"` para `"Dr. Marcos Silveira"` e incluir atualização reativa do documento já existente no MongoDB Atlas.

### MT 17F.2 — Padronização Visual Neutra em `MinhaAgenda.tsx`
- Ação: Substituir os fundos coloridos (`bg-emerald-50`, `bg-blue-50`) por cards elegantes em `bg-white border-gray-200`, padronizando relógio e horários em tons neutros e badges discretos para `LIVRE`, `OCUPADO` e `BLOQUEADO`.

### MT 17F.3 — Limpeza de Cards no `DashboardMedico.tsx`
- Remover o card de ferramenta "Sala de Teleconsulta" (Ação 2), mantendo o ingresso exclusivo pela fila do dia.
- Remover o Card 4 de "Avaliação" (estrelas), reajustando a barra métrica superior para 3 colunas (`grid-cols-1 sm:grid-cols-3`).
- Renomear o card de prontuários para `"Prontuários & Prescrições"`.

### MT 17F.4 — Cronômetro Regressivo Funcional de Degustação/Assinatura
- Implementar contador regressivo com `setInterval` (1s) em `DashboardMedico.tsx` exibindo `dias, horas, minutos e segundos` em tempo real baseado em `trialExpiresAt`.

### MT 17F.5 — Blindagem & Separação na Central de Prontuários
- Arquivo: `DoctorRecordsManagerModal.tsx` e `MedicalRecordViewModal.tsx`.
- Travar botões de ação ("Ver Prontuário" e "Documentos & Receitas") quando `app.status !== 'REALIZADA'`.
- Implementar abas ou seções estritas em `MedicalRecordViewModal.tsx` separando o Prontuário Clínico Principal dos Documentos/Receitas emitidos.

### MT 17F.6 — Reestruturação do Modal de Assinatura SaaS (`AssinaturaSaaSModal.tsx`)
- Eliminar sopa de letrinhas na lista de benefícios da Etapa 1.
- Criar a Etapa 2 de pagamento com formulário de Cartão de Crédito transparente (número, titular, validade, CVV), Pix dinâmico e Checkout Pro do Mercado Pago.
- Adicionar botão `← Voltar para o Plano` na Etapa 2.

---

## 3. Critérios de Aceite

1. O nome do médico aparece exclusivamente como `"Dr. Marcos Silveira"` em toda a interface e no banco de dados.
2. A agenda médica exibe um visual uniforme, profissional e clínico sem saturação policromática.
3. Não há card de sala solto nem card de avaliação de estrelas no Dashboard do Médico.
4. O cronômetro regressivo da degustação/assinatura diminui segundo a segundo de forma viva e precisa.
5. Consultas agendadas não permitem visualização de prontuários não finalizados.
6. O modal de assinatura possui 2 páginas integradas, botão de voltar e formulário de cartão funcional.
