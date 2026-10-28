# ESPECIFICAÇÃO TÉCNICA (SPEC SDD) — MICRO TAREFA 2.2B
## Melhorias no Dossiê de Credenciamento, Upload Frente/Verso e Padronização Bancária (COMPE)
### Active Age — Telessaúde Geriátrica Integral | Fatec Diadema — DSM 3º Semestre
**Status:** Aprovada pelo PO e Implementada com Sucesso ✅  
**Data:** 27 de Outubro de 2026  
**Casos de Uso:** UC03 (Upload do Dossiê Médico), UC04 (Fila e Auditoria de Credenciamento pelo Admin), UC05 (Homologação com Trilha de Auditoria)  
**Regras de Negócio Associadas:** RN004, RN006, RN007, RN008  
**Marcos Regulatórios:** Resolução CFM nº 2.314/2022 (Telemedicina), Lei Federal nº 13.709/2018 (LGPD), Febraban / BACEN (Códigos COMPE)  

---

### 1. Contexto & Diagnóstico dos Problemas Apontados

Durante os testes de homologação do fluxo de Credenciamento Médico, foram identificadas três oportunidades de aprimoramento crítico para a experiência do usuário e consistência dos dados regulatórios:

1. **Diploma de Medicina e CRM (Frente e Verso):**
   - **Problema:** A instrução do Dossiê solicita a entrega de frente e verso do diploma e CRM, contudo o sistema armazenava apenas um arquivo para a chave `DIPLOMA` e `CRM_CARD`. Se o médico possuía fotos avulsas (frente em um arquivo `.jpg`/`.png` e verso em outro), o segundo upload sobrescrevia o primeiro.
   - **Impacto:** Médicos que utilizam câmeras de smartphones não conseguiam submeter as duas faces do documento sem recorrer a softwares externos de junção de PDF.

2. **Formatação e Máscaras de Conta Bancária:**
   - **Problema:** Os campos de Agência, Número da Conta, Chave PIX e CNPJ no Pilar 4 aceitavam caracteres livres sem formatação visual ou bloqueio de caracteres inválidos.
   - **Impacto:** Risco de erros de digitação (ex: esquecimento do dígito verificador na conta, ausência de pontos/traços em CPF/CNPJ), o que pode inviabilizar o repasse automatizado de honorários via Split Direto no gateway.

3. **Padronização da Lista de Bancos (Códigos COMPE / Febraban):**
   - **Problema:** O campo "Banco" era um `input` de texto livre, permitindo grafias variadas (ex: "Itau", "Banco Itaú", "341", "itau sa").
   - **Impacto:** Falta de padronização bancária necessária para a integração de Split Direto em gateways de pagamento regulados pelo BACEN.

---

### 2. Solução Arquitetural Implementada

#### 2.1. Desdobramento de Documentos Frente/Verso (Pilar 1)
- **Novos Tipos de Documento no Backend e Frontend:**
  - `DIPLOMA_VERSO` ("Diploma de Medicina - Verso (Opcional se PDF único)"):
    - Se o médico subir um único arquivo PDF contendo ambas as páginas, basta preencher `DIPLOMA`.
    - Se o médico tiver fotos separadas da frente e do verso, ele faz o upload da Frente em `DIPLOMA` e do Verso em `DIPLOMA_VERSO`.
  - `CRM_CARD_VERSO` ("Carteira do CRM - Verso (Opcional se PDF único)"):
    - Mesma flexibilidade para a carteira de identidade médica do CRM.
- **Regra de Validação de Submissão:**
  - Os documentos continuam com a regra de 7 obrigatórios essenciais (a Frente é mandatória, o Verso avulso é opcional/condicional). Isso impede que médicos com PDF unificado fiquem travados.
  - O modal do auditor administrativo (`AdminDossierModal.tsx`) renderiza ambos os arquivos individualmente com pré-visualização segura.

#### 2.2. Máscaras Inteligentes e Validações de Entrada (Pilar 4)
Implementação de funções puras de formatação reativa (input masks) sem dependências pesadas externas:
- **Agência:** Limite de 4 ou 5 dígitos numéricos, com suporte a dígito verificador opcional (ex: `1234` ou `1234-5`).
- **Número da Conta Corrente/Poupança:** Permite apenas dígitos numéricos e auto-insere o hífen antes do dígito verificador ao final (ex: `12345678-9` ou `0012345-6`).
- **Chave PIX Dinâmica:** Formata conforme o `pixKeyType` selecionado:
  - Se `CPF`: Máscara `000.000.000-00` (11 dígitos).
  - Se `CNPJ`: Máscara `00.000.000/0001-00` (14 dígitos).
  - Se `TELEFONE`: Máscara `(00) 00000-0000` (11 dígitos).
  - Se `EMAIL` ou `ALEATORIA`: Texto livre com validação de formato.
- **CNPJ da PJ Médica:** Máscara `00.000.000/0001-00`.

#### 2.3. Seletor de Bancos Padronizado com Código COMPE
Criação de um catálogo tipado dos bancos oficiais mais utilizados no Brasil (padrão Febraban/BACEN):
- `001 - Banco do Brasil S.A.`
- `033 - Banco Santander (Brasil) S.A.`
- `104 - Caixa Econômica Federal`
- `237 - Banco Bradesco S.A.`
- `260 - Nu Pagamentos S.A. (Nubank)`
- `341 - Itaú Unibanco S.A.`
- `077 - Banco Inter S.A.`
- `212 - Banco Original S.A.`
- `290 - PagBank (PagSeguro)`
- `336 - Banco C6 S.A.`
- `380 - PicPay Serviços S.A.`
- `748 - Banco Cooperativo Sicredi S.A.`
- `756 - Banco Cooperativo Sicoob S.A.`
- `041 - Banco do Estado do Rio Grande do Sul (Banrisul)`
- `070 - Banco de Brasília (BRB)`
- `422 - Banco Safra S.A.`
- `655 - Banco Votorantim S.A.`
- `OUTRO - Outra Instituição Financeira` (permite digitação livre caso o banco não conste na lista).

O seletor é renderizado através de um componente `<select>` estilizado com ícone de banco e busca visual rápida, garantindo acessibilidade e usabilidade tanto no desktop quanto no mobile.

---

### 3. Micro Tarefas Executadas

- **Micro Tarefa 1 (Backend Core):**
  - Atualização de `DocumentType.java` para registrar os enums `DIPLOMA_VERSO` e `CRM_CARD_VERSO`.
  - Manutenção de `MANDATORY_DOCUMENTS` em `DoctorCredentialingService.java` para garantir flexibilidade a PDFs de página única.
- **Micro Tarefa 2 (Frontend Tipos & Definições):**
  - Atualização de `DocumentType` e `DOSSIER_DOCUMENT_DEFINITIONS` em `3-Semestre/frontend-react/src/types/dossier.ts` com novos cards e orientações de upload.
- **Micro Tarefa 3 (Máscaras e Validações Bancárias):**
  - Criação do utilitário `bankMasks.ts` para Agência, Conta, PIX e CNPJ.
  - Integração dos formatadores no estado reativo do formulário do Pilar 4 em `DossieCredenciamento.tsx`.
- **Micro Tarefa 4 (Seletor Padronizado de Bancos):**
  - Definição da constante `BRAZILIAN_BANKS` com os códigos oficiais COMPE.
  - Substituição do input de texto por `<select>` intuitivo com fallback para "Outro banco".
- **Micro Tarefa 5 (Validação e Homologação):**
  - Execução dos testes e compilação limpa, garantindo estabilidade e integridade funcional.

---

### 4. Critérios de Aceite Validados

- [x] O médico consegue anexar a frente do diploma em um item e o verso em outro (ou manter tudo em um único PDF sem impedimento de submissão).
- [x] O campo de banco apresenta os códigos COMPE dos principais bancos brasileiros ordenados e de fácil seleção.
- [x] Os campos de agência e conta possuem máscaras visuais que impedem caracteres alfabéticos indevidos e formatam o dígito verificador.
- [x] A chave PIX adapta sua máscara automaticamente ao tipo selecionado (CPF, CNPJ ou Telefone).
- [x] O painel do Administrador (`AdminDossierModal.tsx`) visualiza o verso do diploma e do CRM de forma independente.
