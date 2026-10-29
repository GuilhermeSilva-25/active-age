# 📋 ESPECIFICAÇÃO TÉCNICA (SPEC): VITRINE E BUSCA INTELIGENTE DE MÉDICOS GERIATRAS

> **Código da Spec:** SPEC-07  
> **Projeto:** Active Age — Plataforma Integral de Telessaúde Geriátrica  
> **Módulo:** Vitrine Informativa Neutra & Catálogo de Especialistas Geriátricos  
> **Casos de Uso Relacionados:** UC08 (Buscar Médico Geriatra: Pesquisa inteligente de profissionais ativos e validados) — Requisitos Funcionais: RF005, RF014 | Regras de Negócio: RN004  
> **Normas de Referência Ética & Regulatória:** Resolução CFM nº 2.336/2023 (Publicidade Médica e Busca Neutra), Resolução CFM nº 2.314/2022 (Telemedicina), Lei Geral de Proteção de Dados (LGPD nº 13.709/2018)  
> **Data:** 28 de Outubro de 2026  
> **Status:** CONCLUÍDA E HOMOLOGADA EM PRODUÇÃO ✅  
> **Metodologia:** Spec-Driven Development (SDD)

---

## 1. Contexto & Diagnóstico da Necessidade

Com a conclusão do módulo de **Gestão de Perfil de Usuário (SPEC-06 / UC18)** e o semeador de médicos homologados em homenagem aos grandes pioneiros da tecnologia (**SPEC-05C**), o Active Age conta agora com perfis médicos ricos, contendo foto de rosto (avatar), RQE (Registro de Qualificação de Especialista), biografia clínica, lista de focos de atuação geriátrica, honorários por teleconsulta e duração estimada de atendimento.

A presente especificação técnica detalha o **Caso de Uso UC08 (Buscar Médico Geriatra)**, que compõe o primeiro pilar da **Sprint 3 (Release v0.3.0)**. O objetivo é fornecer uma **interface amigável, acessível (WCAG 2.1 AA) e em estrito compliance ético com o CFM**, permitindo que idosos e cuidadores familiares encontrem o médico geriatra mais adequado às suas necessidades clínicas e geográficas.

---

## 2. Conformidade Ético-Médica & Regulatória Inegociável (CFM & LGPD)

### 2.1. Resolução CFM nº 2.336/2023 (Neutralidade Absoluta da Vitrine)
1. **Proibição de Rankings de Estrelas ou Notas:** Não haverá avaliação pública por "estrelas", notas ou feedbacks pejorativos na vitrine (vedação expressa à mercantilização da medicina como produto de e-commerce).
2. **Proibição de Leilão ou Destaque Pago:** É terminantemente proibida a cobrança de qualquer taxa adicional por "posicionamento privilegiado" ou selos de anúncio pago ("médico em destaque"). Todos os médicos credenciados concorrem em igualdade ética.
3. **Ordenação por Parâmetros Objetivos:** A ordenação dos resultados deve ser estritamente baseada em critérios lógicos e transparentes escolhidos pelo próprio usuário:
   - Ordem alfabética de nome (`A-Z` ou `Z-A`);
   - Menor valor de consulta (`R$`);
   - Maior valor de consulta (`R$`);
4. **Transparência de Qualificação Médica:** Todo card de médico na vitrine DEVE exibir de forma clara e destacada:
   - Nome completo do profissional;
   - Número do CRM e Estado emissor (UF);
   - Número do Registro de Qualificação de Especialista (RQE em Geriatria);
   - Tempo estimado de consulta e honorários brutos;
   - Link oficial para o Currículo Lattes do CNPq (quando disponível).

### 2.2. Regra de Negócio RN004 (Validação Perimetral de Exibição)
- Um médico **SÓ PODE APARECER NA VITRINE** se cumprir simultaneamente:
  - `role == Role.ROLE_MEDICO`
  - `active == true` (conta não bloqueada pelo Administrador)
  - `dossierStatus == DoctorDossierStatus.APPROVED` (dossiê documental validado e homologado na auditoria)
- Qualquer médico com cadastro pendente (`PENDING_DOCS`), em análise (`UNDER_REVIEW`), reprovado (`DOCS_REJECTED`) ou inativo/suspenso **JAMAIS** é retornado pela API ou exibido no catálogo.

### 2.3. Blindagem de Dados Sensíveis (LGPD)
- O payload retornado para a vitrine pública/paciente **NUNCA DEVE EXPOR**:
  - CPF ou documento civil;
  - Dados bancários e chaves PIX (`financialInfo`);
  - Documentos internos enviados no dossiê (diplomas, certidões éticas);
  - E-mail e telefone pessoal;
  - Senha (mesmo criptografada).

---

## 3. Arquitetura da Solução & Modelagem Backend

### 3.1. DTO de Resposta do Catálogo (`DoctorPublicProfileResponse.java`)

```java
package com.activeage.core.dtos.responses;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorPublicProfileResponse {
    private String id;
    private String fullName;
    private String avatarUrl;
    private String crm;
    private String ufCrm;
    private String rqe;
    private String bio;
    private List<String> clinicalFocus;
    private BigDecimal consultationFee;
    private Integer consultationDurationMinutes;
    private String lattesUrl;
}
```

### 3.2. Endpoints da API RESTful (`DoctorController.java`)

1. **`GET /api/doctors/search`:**
   - **Permissão de Acesso:** Aberto para usuários autenticados (`ROLE_PACIENTE`, `ROLE_ADMIN`, `ROLE_MEDICO`) e disponível para o público geral (visitantes) para visualização de especialistas.
   - **Parâmetros Opcionais de Query String:**
     - `q` (String): Busca textual case-insensitive no nome do médico, na biografia ou no RQE.
     - `uf` (String): Filtro por Unidade Federativa do CRM (ex: "SP", "RJ", "MG").
     - `focus` (String): Filtro por área de foco geriátrico (ex: "Memória", "Quedas", "Polifarmácia").
     - `maxFee` (BigDecimal): Teto máximo de valor de honorários (ex: 300.00).
     - `sort` (String): Critério de ordenação (`name_asc` [default], `name_desc`, `fee_asc`, `fee_desc`).
   - **Retorno:** `HTTP 200 OK` com `List<DoctorPublicProfileResponse>`.

2. **`GET /api/doctors/{id}`:**
   - **Finalidade:** Retorna os detalhes públicos de um médico específico para exibição no Modal de Biografia Completa ou para abertura direta da agenda no UC09.
   - **Retorno:** `HTTP 200 OK` com `DoctorPublicProfileResponse` ou `HTTP 404 Not Found`.

### 3.3. Lógica de Filtragem e Serviço (`DoctorService.java`)
- O serviço utilizará consultas dinâmicas ou filtragem orientada a streams/Spring Data MongoDB garantindo que apenas registros com `role = ROLE_MEDICO`, `active = true` e `dossierStatus = APPROVED` sejam considerados.
- Aplicação dos critérios de busca combinados de forma aditiva (AND).

---

## 4. Design de Interface & Acessibilidade (IHC / WCAG 2.1 AA)

### 4.1. Nova Página: `BuscaMedicos.tsx` (`/paciente/busca-medicos`)
- **Header Superior:** Integrado ao design do Portal do Paciente, exibindo logo, saudação ao usuário e atalho de retorno ao Dashboard.
- **Barra de Pesquisa Inteligente:** Campo amplo com ícone de lupa, botão de limpar rápida e texto de ajuda: *"Pesquise pelo nome do médico ou área de interesse (ex: Memória, Quedas, Demências)..."*.
- **Filtros Rápidos Táteis (Chips Grandes):**
  - **Filtro de Estado (UF):** Seletor rápido de estados brasileiros (com opção "Todos os Estados").
  - **Filtro de Foco Clínico:** Chips clicáveis com temas geriátricos fundamentais:
    - *Todos*
    - *Avaliação Geriátrica Ampla (AGA)*
    - *Memória e Demências*
    - *Prevenção de Quedas & Mobilidade*
    - *Polifarmácia & Desprescrição*
    - *Cuidados Paliativos*
    - *Longevidade Ativa & Prevenção*
  - **Filtro de Faixa de Preço:** Sliders ou botões de seleção de teto (ex: "Até R$ 250", "Até R$ 350", "Sem limite").
  - **Ordenação Ética CFM:** Dropdown com as 3 opções neutras:
    - *Nome (A - Z)* [Padrão]
    - *Menor Valor da Consulta*
    - *Maior Valor da Consulta*
- **Contador Transparente de Resultados:**
  - *"Exibindo X médicos geriatras homologados e disponíveis"*.
- **Card do Médico (Design de Alta Acessibilidade):**
  - Foto do médico com borda estilizada e avatar fallback com iniciais;
  - Selo visual verde com ícone de verificação: *"Homologado CFM & Active Age"*;
  - Nome completo com destaque e tipografia legível;
  - Badges informativos: CRM, UF e RQE destacados;
  - Resumo da biografia clínica com truncamento visual elegante;
  - Tags de áreas de atuação em chips coloridos suaves;
  - Preço da consulta em destaque (ex: `R$ 250,00`) e tempo estimado (`60 min`);
  - Dois botões de ação com alvos táteis mínimos de 48px:
    1. **"Ver Perfil Completo":** Abre modal com histórico detalhado e link do Currículo Lattes.
    2. **"Agendar Consulta" (Botão Principal):** Destacado em laranja (`brand-orange`), preparado para redirecionar o paciente para a seleção de horários disponíveis (UC09).
- **Estado Vazio Construtivo (Empty State):**
  - Ilustração/ícone amigável com mensagem acolhedora: *"Nenhum médico encontrado com os filtros selecionados. Tente buscar por outro termo ou limpar os filtros."* com botão de ação *"Limpar Todos os Filtros"*.
- **Skeleton / Carregamento Acessível:**
  - Animação de pulso suave durante requisições de busca para evitar layout shift.

### 4.2. Integração no `DashboardPaciente.tsx`
- O Card de Ação Rápida *"Agendar Consulta Geriátrica"* no Dashboard do Paciente deixará de exibir a mensagem informativa de "Em breve" e passará a navegar diretamente para `/paciente/busca-medicos`.

---

## 5. Roteiro de Testes e Critérios de Aceite (BDD)

```gherkin
Funcionalidade: Vitrine Neutra e Busca Inteligente de Médicos Geriatras (UC08 / RF005)
  Como um Paciente idoso ou Cuidador familiar
  Eu quero pesquisar médicos geriatras por especialidade, estado, nome e honorários
  Para que eu possa escolher o profissional ideal com total transparência e segurança ética

  Cenário: Listagem inicial de médicos pioneiros homologados
    Dado que o paciente acessa a página de busca de médicos
    Quando a tela é carregada
    Então o sistema exibe os 5 médicos pioneiros cadastrados (Ada Lovelace, Alan Turing, Grace Hopper, Margaret Hamilton e Tim Berners-Lee)
    E todos os cards apresentam foto, CRM, UF, RQE, tags de foco e valor de consulta
    E a lista está ordenada alfabeticamente por padrão

  Cenário: Filtro por área de foco clínico geriátrico
    Dado que a vitrine de médicos está aberta
    Quando o paciente clica no chip "Memória e Demências"
    Então a vitrine atualiza exibindo apenas médicos que possuam essa tag em seu foco clínico
    E o contador de resultados reflete o total filtrado

  Cenário: Filtro por Unidade Federativa (UF)
    Dado que a vitrine de médicos está aberta
    Quando o paciente seleciona a UF "SP"
    Então a vitrine exibe apenas médicos cujo CRM seja de São Paulo (Dra. Ada Lovelace e Dr. Alan Turing)

  Cenário: Ordenação por Menor Valor de Consulta
    Dado que a vitrine de médicos está aberta
    Quando o paciente altera a ordenação para "Menor Valor de Consulta"
    Então o primeiro médico exibido na lista é o Dr. Tim Berners-Lee (R$ 200,00)

  Cenário: Médico não homologado ou suspenso não é exibido (RN004)
    Dado que existe um médico com status "PENDING_DOCS" ou "active = false"
    Quando o paciente realiza qualquer busca no catálogo
    Então esse médico JAMAIS deve ser retornado pela API nem exibido na vitrine

  Cenário: Proteção de dados pessoais e sigilo de dossiê (LGPD)
    Dado que o payload de resposta da busca é inspecionado
    Quando o JSON de retorno é analisado
    Então ele NÃO deve conter CPF, senha, dados bancários, comprovantes ou telefone pessoal do médico
```

---

## 6. Plano de Ação & Micro Tarefas para Execução

1. **Backend:**
   - Criar `DoctorPublicProfileResponse.java` em `core/dtos/responses/`.
   - Criar `DoctorService.java` com métodos de busca dinâmica filtrada e consulta individual.
   - Criar `DoctorController.java` com endpoints `GET /api/doctors/search` e `GET /api/doctors/{id}`.
   - Liberar a rota `/api/doctors/**` no `SecurityConfig.java`.
   - Validar compilação com `./mvnw.cmd test-compile -o`.
2. **Frontend:**
   - Criar a página `BuscaMedicos.tsx` em `src/pages/paciente/`.
   - Criar o componente de Modal de Detalhes do Médico `DoctorDetailModal.tsx`.
   - Atualizar `DashboardPaciente.tsx` para direcionar o Card 1 para `/paciente/busca-medicos`.
   - Adicionar a rota `/paciente/busca-medicos` no `App.tsx`.
   - Validar tipagem e build com `npm run build`.
3. **Documentação e Auditoria:**
   - Atualizar `ROTEIRO_DE_TESTES_BDD_ACTIVE_AGE.md` com a nova suíte de testes do UC08.
   - Atualizar `PLANO_DE_RELEASE_ACTIVE_AGE.md` e o Catálogo de Specs (`README.md`).
   - Realizar commits atômicos com Conventional Commits em português e submeter ao GitHub (`git push`).
