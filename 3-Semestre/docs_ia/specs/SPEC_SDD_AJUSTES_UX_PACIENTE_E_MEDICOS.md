# 📋 SPEC-17C: Ajustes de UX e Identificação Visual do Paciente e Vitrine Médica

---

## 1. Identificação & Contexto
* **Identificador:** SPEC-17C
* **Título:** Ajustes de Usabilidade, Sanitização de Dados e Limpeza Visual (Paciente & Médicos)
* **Status:** Aprovado para Execução ✅
* **Autor:** Antigravity Pair Programmer & Guilherme Silva (Tech Lead & PO)
* **Data:** 07 de Novembro de 2026

---

## 2. Motivação & Requisitos
Durante os testes executivos integrados realizados pelo PO Guilherme, foram identificados 5 pontos de fricção e ruído visual na experiência do paciente e na vitrine de especialistas médicos:
1. **Nome do Paciente de Teste:** O nome semeado continha "Dona" e o sufixo "(Paciente Teste)", gerando aspecto artificial nas telas de agendamento e teleconsulta. Deve ser padronizado como "Maria de Lourdes Silva".
2. **Tag de Busca Neutra:** Na página de busca de médicos (`BuscaMedicos.tsx`), a tag visual "Pesquisa Neutra & Homologada CFM" no banner superior adicionava ruído e redundância visual.
3. **Duplicação da Sigla RQE:** No perfil do médico, a sigla RQE estava sendo exibida em duplicidade (ex: "RQE RQE 12345"), decorrente da concatenação de "RQE" com um valor que já continha a sigla.
4. **Nota Ética no Perfil do Médico:** A caixa com "Nota Ética CFM" no modal de detalhes do médico (`DoctorDetailModal.tsx`) é redundante e sobrecarrega a rolagem para o paciente idoso.
5. **Tag de Homologação nos Cards dos Médicos:** A badge "Homologado CFM" nos cards de médicos deve ser simplificada para "Homologado", conferindo maior leveza e foco institucional.

---

## 3. Detalhamento Técnico das Modificações

### 3.1. Backend Core (`DoctorScheduleAutomationService.java` & Testes)
- Atualização do método `ensureTestPatient()`:
  - Para novas criações: `p.setFullName("Maria de Lourdes Silva")`.
  - Para paciente já existente no MongoDB Atlas: verificação reativa para remover "Dona" e "(Paciente Teste)", atualizando o registro no banco para `"Maria de Lourdes Silva"`.
- Atualização do teste `DoctorScheduleAutomationServiceTest.java` com o novo nome limpo.

### 3.2. Frontend React (`DoctorDetailModal.tsx`)
- **Sanitização de RQE:** Extração da parte numérica via `doctor.rqe.replace(/^RQE[:\s]*/i, '').trim()`, exibindo de forma limpa `RQE {formattedRqe}`.
- **Remoção da Nota Ética:** Eliminação da `<div>` com o texto de Nota Ética CFM.
- **Tag Simplificada:** Alteração da tag do cabeçalho de `Homologado CFM & Active Age` para `Homologado`.

### 3.3. Frontend React (`BuscaMedicos.tsx`)
- **Remoção do Selo no Banner:** Exclusão da tag "Pesquisa Neutra & Homologada CFM".
- **Badge do Card:** Atualização de `Homologado CFM` para `Homologado`.
- **Sanitização de RQE:** Aplicação do mesmo regex `.replace(/^RQE[:\s]*/i, '').trim()` nos cards.

### 3.4. Frontend React (`AgendarConsultaModal.tsx`)
- Atualização dos fallbacks textuais de `'Dona Maria da Silva'` para `'Maria de Lourdes Silva'`.

---

## 4. Critérios de Aceite
1. [x] O nome do paciente de teste é exibido exclusivamente como `Maria de Lourdes Silva`, sem "Dona" e sem "(Paciente Teste)".
2. [x] O banner da página de busca de médicos não exibe a tag "Pesquisa Neutra & Homologada CFM".
3. [x] O número de RQE nos cards e no modal do médico exibe a sigla apenas uma vez (ex: "RQE 12345").
4. [x] O modal de detalhes do médico não exibe a seção de "Nota Ética CFM".
5. [x] A badge dos cards dos médicos exibe "Homologado" (sem o sufixo "CFM").
6. [x] 100% dos testes automatizados do backend (184 no Core + 39 no Pagamento) e build do frontend continuam passando sem erros.
