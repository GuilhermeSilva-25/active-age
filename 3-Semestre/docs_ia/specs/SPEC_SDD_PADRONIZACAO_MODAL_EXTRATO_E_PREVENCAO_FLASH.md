# 📄 SPEC-17J — Padronização Visual do Modal de Extrato & Prevenção de Flash de Conteúdo (FOUC)

> **Status:** Proposta Técnica (Aguardando Aprovação / Implementação)  
> **Autor:** Antigravity Pair Programmer Sênior  
> **Data:** 07 de Novembro de 2026  
> **Semestre de Foco:** 4º Semestre (Acessibilidade IHC/WCAG & Design System)  
> **Documentos Relacionados:** SPEC-17G, SPEC-17H, SPEC-17I, `FeedbackModal.tsx`, `ExtratoFinanceiroModal.tsx`, `DashboardMedico.tsx`

---

## 1. Contexto & Diagnóstico

Durante os testes de usabilidade realizados pelo Tech Lead & PO (Guilherme Silva) antes de efetuar o pagamento da assinatura SaaS, foram apontadas duas falhas críticas:

1. **Flash de Conteúdo Indevido (*Flash of Unhydrated Content / FOUC*):**
   - Ao clicar no card de Extrato antes de assinar, o modelo completo do extrato timbrado aparecia por uma fração de segundo na tela, antes de sumir e ser substituído pela mensagem de ausência de plano.
   - **Causa Raiz:** O modal renderizava o documento contábil como padrão quando `loading` era `true`. Durante o tempo de requisição assíncrona ao backend, o componente exibia o template completo com dados não liquidados, gerando o efeito de *flash*.

2. **Incompatibilidade Estética do Modal com o Padrão do Sistema (*Design System Break*):**
   - O modal exibido no estado vazio utilizava caixas pequenas cinzentas (`rounded-2xl`, `border-gray-200`, botões pretos com `py-2.5` e fundo escurecido genérico), destoando do componente oficial de acessibilidade e design do projeto Active Age (`FeedbackModal.tsx`).
   - Conforme a **Regra 3 do GEMINI.md (Padrão de UI & Acessibilidade IHC/WCAG)**, todas as caixas de diálogo e feedbacks devem respeitar os botões táteis ampliados para o público maduro (`min-h-[50px]`), paleta institucional (`border-brand-pot`, `text-brown-dark`, `bg-brand-orange`), ícone descritivo em container de `80x80px` (`rounded-2xl`) e backdrop em `bg-slate-900/40 backdrop-blur-sm`.

---

## 2. Micro Tarefas Detalhadas

### Micro Tarefa 17J.1 — Eliminação do Flash de UI (*FOUC*)
1. Em `ExtratoFinanceiroModal.tsx`, garantir que o template timbrado contábil seja renderizado **estritamente se `pagamentos.length > 0`**.
2. Enquanto `loading` estiver ativo, renderizar um estado de carregamento elegante com spinner `Loader2` centralizado dentro do container padrão Active Age, prevenindo qualquer vazamento da tela do extrato antes da validação dos dados.

### Micro Tarefa 17J.2 — Padronização Visual do Estado Vazio Alinhado ao `FeedbackModal.tsx`
1. Redesenhar o modal de estado vazio do extrato para espelhar rigorosamente o layout e acessibilidade de `FeedbackModal.tsx`:
   - Backdrop: `bg-slate-900/40 backdrop-blur-sm transition-opacity`;
   - Container: `relative w-full max-w-md bg-white rounded-3xl p-6 md:p-8 shadow-2xl border-2 border-brand-pot/40 text-center`;
   - Ícone: Container `w-20 h-20 rounded-2xl border-2 bg-amber-50 border-amber-200 text-brand-orange` com `Receipt`;
   - Título: `text-2xl md:text-3xl font-extrabold text-brown-dark mb-3 tracking-tight`;
   - Mensagem: `text-base md:text-lg text-brown-dark/80 leading-relaxed mb-8 font-medium`;
   - Botões Táteis Acessíveis:
     - Fechar: `min-h-[50px] px-6 py-3 rounded-xl border-2 border-brand-pot text-brown-dark font-bold hover:bg-gray-50`;
     - Assinar Consultório: `min-h-[50px] px-6 py-3 rounded-xl font-bold bg-brand-orange hover:bg-orange-600 text-white shadow-md hover:shadow-lg inline-flex items-center justify-center gap-2.5`;
   - Botão de fechar (X) acessível no topo direito.

---

## 3. Critérios de Aceite
1. Ao clicar em Extrato antes de assinar o plano, **nenhum flash** do extrato timbrado é exibido.
2. É exibido um carregamento limpo e, em seguida, o modal de estado vazio com a mensagem explicativa.
3. O modal de estado vazio respeita 100% o padrão visual de `FeedbackModal.tsx` (cores, bordas, fontes e botões táteis).
4. O botão "Assinar Consultório" direciona com fluidez para o modal de assinatura do plano.
5. Após assinar e liquidar a assinatura, o extrato oficial P&B abre normalmente com a fatura liquidada.
6. A compilação do Vite e testes do backend passam com zero erros.
