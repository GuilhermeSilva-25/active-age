# 📄 SPEC-17D — Comprovante de Pagamento em Preto e Branco (P&B) & Isolamento de Impressão Universal

> **Status:** Proposta Técnica (Aguardando Aprovação do PO)  
> **Autor:** Antigravity Pair Programmer Sênior  
> **Data:** 07 de Novembro de 2026  
> **Semestre de Foco:** 4º Semestre (Homologação & Qualidade)  
> **Documentos Relacionados:** SPEC-12B (Receituário P&B), SPEC-17B (Ecossistema de Pagamentos), `DocumentPrintModal.tsx`

---

## 1. Contexto & Diagnóstico do Problema

Durante a homologação executiva realizada pelo Tech Lead & PO (Guilherme Silva), foram identificados dois pontos críticos no comprovante de pagamento de teleconsultas (`ComprovantePagamentoModal.tsx`):

1. **Incompatibilidade Estética com Padrão Documental Oficial:**
   - O comprovante utilizava identidade visual colorida em tons de verde e esmeralda (`bg-emerald-800`, `border-emerald-300`, `text-emerald-950`).
   - Todos os documentos oficiais da plataforma (Receitas Médicas Digitais, Pedidos de Exames Complementares e Atestados Médicos em `DocumentPrintModal.tsx`) seguem o padrão regulatório em **Preto e Branco Puro (P&B)**, otimizado para economia de tinta, legibilidade máxima e aceitação em operadoras de saúde, Receita Federal e farmácias.

2. **Vazamento de Conteúdo na Impressão (`print leak`):**
   - Ao clicar no botão *"Imprimir / Salvar PDF"*, o comando `window.print()` renderizava a tela inteira de fundo (`MinhasConsultas.tsx` com Topbar, abas, lista de consultas e rodapé) por baixo ou ao lado do modal.
   - Isso ocorria porque o Tailwind e o CSS global careciam de uma diretiva explícita `@media print` para ocultar o restante do DOM e isolar unicamente o container do documento imprimível.

---

## 2. Solução Arquitetural Proposta

### 2.1. Isolamento Universal de Impressão (`index.css`)
Implementação de regras de mídia `@media print` no arquivo de estilos globais [`index.css`](file:///c:/Users/guilh/OneDrive/Documentos/active-age/3-Semestre/frontend-react/src/index.css):

```css
@media print {
  /* Oculta tudo que não for o documento imprimível */
  body {
    visibility: hidden !important;
    background: white !important;
  }

  /* Isola e exibe exclusivamente o container com a classe .printable-document */
  .printable-document,
  .printable-document * {
    visibility: visible !important;
  }

  .printable-document {
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    background: white !important;
    border: none !important;
    box-shadow: none !important;
  }

  /* Garante ocultação de botões, barras de ferramentas e cabeçalhos não imprimíveis */
  .print\:hidden {
    display: none !important;
  }

  @page {
    size: A4 portrait;
    margin: 12mm 15mm 15mm 15mm;
  }
}
```

### 2.2. Reformulação do `ComprovantePagamentoModal.tsx` para P&B Puro
Alinhamento visual rigoroso com o [`DocumentPrintModal.tsx`](file:///c:/Users/guilh/OneDrive/Documentos/active-age/3-Semestre/frontend-react/src/components/teleconsulta/DocumentPrintModal.tsx):
- **Barra de Ferramentas Superior (Não Impressa):** Fundo cinza claro (`bg-gray-100`), borda cinza (`border-gray-300`), botão de fechar e botão *"Imprimir / Salvar PDF"* em preto puro (`bg-black text-white hover:bg-gray-800`).
- **Cabeçalho Timbrado Oficial P&B:**
  - Letreiro institucional: `"ACTIVE AGE • TELESSAÚDE GERIÁTRICA"` com CNPJ e sede.
  - Título do documento: `"RECIBO DE PAGAMENTO DE TELECONSULTA"`.
  - Código de Autenticidade Digital: `AA-REC-2026-XXXXXX` em caixa alta com fonte monoespaçada e moldura preta.
- **Quadro de Discriminação Financeira:**
  - Molduras pretas/cinzas de 1px e 2px.
  - Dados do Paciente Pagador e Médico Beneficiário com CRM/UF e especialidade.
  - Data da consulta, forma de pagamento (Pix, Cartão de Crédito ou Mercado Pago Pro), ID da transação no Mercado Pago.
  - Tabela clara: Taxa da Plataforma = **R$ 0,00 (0% Dicotomia)** e Repasse Médico = **100% (R$ XXX,XX)** conforme Res. CFM nº 2.314/2022.
- **Nota Ético-Regulatória & LGPD:** Moldura cinza fina, texto explicativo sem diagnósticos nem CID-11.
- **Rodapé Timbrado:** Linha de assinatura do prestador médico e instruções de validação pública em `activeage.com/validar-documento`.

---

## 3. Plano de Micro Tarefas

- [ ] **MT 17D.1 — Isolamento de Impressão Global em `index.css`:**
  Adicionar regras `@media print` e `@page` com suporte universal à classe `.printable-document` e `.print:hidden`.
- [ ] **MT 17D.2 — Redesenho P&B do `ComprovantePagamentoModal.tsx`:**
  Remover todas as estilizações esmeralda e amarela, adotando tons de cinza e preto puro e aplicando a classe `.printable-document`.
- [ ] **MT 17D.3 — Aplicação da Classe nos Demais Modais Imprimíveis:**
  Adicionar a classe `.printable-document` também em [`DocumentPrintModal.tsx`](file:///c:/Users/guilh/OneDrive/Documentos/active-age/3-Semestre/frontend-react/src/components/teleconsulta/DocumentPrintModal.tsx) e [`ExtratoFinanceiroModal.tsx`](file:///c:/Users/guilh/OneDrive/Documentos/active-age/3-Semestre/frontend-react/src/components/medico/ExtratoFinanceiroModal.tsx) para blindar todas as impressões do sistema.
- [ ] **MT 17D.4 — Verificação e Homologação:**
  Executar build do Vite e suíte de testes automatizados.

---

## 4. Critérios de Aceite

1. Ao acionar o botão de impressão no comprovante de teleconsulta, **apenas** o comprovante é exibido no diálogo de impressão/PDF do navegador; nenhum elemento da página `MinhasConsultas.tsx` (menus, cards de consulta, rodapé) deve vazar.
2. Todo o comprovante de pagamento impresso ou em tela apresenta estética estritamente **Preto e Branco**, idêntica aos receituários e atestados.
3. As informações do pagador, médico (CRM/UF), código digital `AA-REC-2026-XXXXXX` e ID do Mercado Pago permanecem 100% legíveis e preservadas.
