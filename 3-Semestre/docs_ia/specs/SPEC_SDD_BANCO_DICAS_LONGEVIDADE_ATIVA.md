# SPEC-11G: Banco de Dicas de Longevidade Ativa com Evidências Médicas e Rotação Dinâmica
## Metodologia: Spec-Driven Development (SDD)
### Projeto: Active Age — Telessaúde Geriátrica Integral (DSM / Fatec Diadema)

---

## 1. Contexto & Motivação
A plataforma Active Age visa promover a saúde preventiva, a autonomia e a qualidade de vida da pessoa idosa. Anteriormente, o `DashboardPaciente.tsx` continha apenas um card com texto estático sobre hidratação.

Para enriquecer a experiência do idoso e do cuidador familiar com conteúdo médico relevante, educativo e confiável, este módulo introduz um banco estruturado de dicas de saúde geriátrica e longevidade ativa, baseado exclusivamente em estudos e diretrizes de sociedades médicas nacionais e internacionais.

---

## 2. Objetivos
1. Criar um banco de dados em TypeScript contendo 12 dicas clínicas consolidadas, fundamentadas em literatura científica da SBGG, OMS, Harvard, The Lancet, EWGSOP2, SBIm e Ministério da Saúde.
2. Implementar rotação dinâmica das dicas:
   - A cada atualização da página (F5 ou nova navegação), uma dica aleatória é selecionada e exibida.
   - Fornecer botão tátil ampliado *"Ver outra dica"* para rotação imediata sob demanda sem necessidade de recarregar a tela inteira.
3. Exibir com clareza o selo de evidência médica e a fonte científica em cada dica.
4. Seguir as diretrizes de acessibilidade IHC / WCAG 2.1 AA (alvos táteis de no mínimo 44px, contraste adequado e ícones descritivos).

---

## 3. Especificação Técnica dos Componentes

### 3.1. Estrutura de Dados (`dicasLongevidade.ts`)
* Interface:
  ```typescript
  export interface DicaLongevidade {
      id: string;
      tema: string;
      titulo: string;
      descricao: string;
      fonteCientifica: string;
      icone: string;
  }
  ```
* Catálogo de 12 intervenções preventivas:
  1. Hidratação e Fisiologia da Sede (SBGG)
  2. Treinamento Resistido e Sarcopenia (EWGSOP2 & ACSM)
  3. Reserva Cognitiva e Neuroplasticidade (Estudo FINGER / The Lancet)
  4. Prevenção Ambiental de Quedas (OMS & SBGG)
  5. Polifarmácia e Desprescrição (Critérios de Beers / AGS)
  6. Higiene do Sono e Ritmo Circadiano (Associação Brasileira do Sono)
  7. Nutrição e Dieta Mediterrânea / MIND (Rush University & AHA)
  8. Vínculos Sociais e Longevidade (Estudo de Harvard)
  9. Preservação Sensorial Auditiva e Visual (Comissão The Lancet)
  10. Equilíbrio e Flexibilidade Articular (Sociedade Brasileira de Reumatologia)
  11. Imunossenescência e Vacinação (SBIm & SBGG)
  12. Saúde Bucal e Mastigação Eficiente (CFO & SBGG)

### 3.2. Componente Reativo (`CardDicaLongevidade.tsx`)
* Estado local com a dica ativa.
* Efeito de rotação aleatória ao montar o componente.
* Ação de alternar dica sem repetição imediata.
* Design responsivo com gradiente suave, badge temático, título semântico, texto explicativo e rodapé com selo da fonte médica.

### 3.3. Integração (`DashboardPaciente.tsx`)
* Substituição do card estático anterior pelo `<CardDicaLongevidade />`.

---

## 4. Critérios de Aceite
- [x] O banco contém 12 dicas de saúde geriátrica fundamentadas em fontes médicas oficiais.
- [x] A página do paciente exibe uma dica aleatória a cada atualização/visita.
- [x] O botão "Ver outra dica" permite navegar pelas orientações interativamente.
- [x] Cada dica exibe explicitamente a fonte científica/médica responsável.
- [x] Build do frontend (`npm run build`) validado com zero erros de compilação.
