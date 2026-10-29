# 📋 ESPECIFICAÇÃO TÉCNICA (SPEC): PADRONIZAÇÃO DAS FOTOS DOS MÉDICOS HOMENAGEADOS COM RETRATOS HISTÓRICOS REAIS

> **Código da Spec:** SPEC-11D  
> **Projeto:** Active Age — Plataforma Integral de Telessaúde Geriátrica  
> **Módulo:** Semeador de Dados & Vitrine de Especialistas Credenciados (UC08 / RF006)  
> **Casos de Uso Relacionados:** UC08 (Busca e Vitrine de Médicos), UC09 (Agendamento de Teleconsulta)  
> **Requisitos Funcionais / Regras de Negócio:** RF006, RN008  
> **Normas de Referência Ética & Regulatória:** Resolução CFM nº 2.336/2023 (Divulgação informativa e identificação fidedigna do profissional)  
> **Data:** 29 de Outubro de 2026  
> **Status:** CONCLUÍDA E HOMOLOGADA EM PRODUÇÃO ✅  
> **Metodologia:** Spec-Driven Development (SDD)

---

## 1. Contexto & Diagnóstico da Demanda

Na vitrine de telemedicina do Active Age, foram semeados 17 médicos geriatras pioneiros que homenageiam grandes nomes da história da computação e da ciência.
Atualmente:
- Os 5 primeiros médicos pioneiros (Ada Lovelace, Alan Turing, Grace Hopper, Margaret Hamilton e Tim Berners-Lee) possuem fotos reais e históricas extraídas do acervo do Wikimedia Commons.
- Os 12 médicos subsequentes (Dennis Ritchie, Claude Shannon, Katherine Johnson, John von Neumann, Barbara Liskov, Donald Knuth, Hedy Lamarr, Linus Torvalds, Radia Perlman, Leslie Lamport, Frances Allen e Edgar F. Codd) foram configurados provisoriamente com fotos genéricas de banco de imagens (Unsplash).

**Objetivo:**
Substituir 100% das fotos genéricas por retratos históricos reais de domínio público e arquivos oficiais (Wikimedia Commons, NASA, Tekniska Museet, MIT, LinuxCon e IBM Archives), garantindo a autenticidade da homenagem e uma identidade visual rica, coerente e impactante para a apresentação do projeto.

---

## 2. Mapeamento dos Retratos Históricos Reais

| Nº | Médico Homenageado | Estado | CRM | URL Atual (Genérica / Temporária) | Nova URL Real (Wikimedia / Domínio Público) | Fonte & Arquivo Histórico |
| :---: | :--- | :---: | :---: | :--- | :--- | :--- |
| **1** | Dra. Ada Lovelace | SP | 184201 | *Já real* | `https://upload.wikimedia.org/wikipedia/commons/a/a4/Ada_Lovelace_portrait.jpg` | Pintura oficial de 1840 (Alfred Chalon) |
| **2** | Dr. Alan Turing | SP | 193602 | *Já real* | `https://upload.wikimedia.org/wikipedia/commons/7/79/Alan_Turing_az_1930-as_%C3%A9vekben.jpg` | Retrato clássico de Elliott & Fry (década de 1930) |
| **3** | Dra. Grace Hopper | SP | 195203 | *Já real* | `https://upload.wikimedia.org/wikipedia/commons/a/ad/Commodore_Grace_M._Hopper%2C_USN_%28covered%29.jpg` | Retrato oficial de Contra-Almirante da Marinha dos EUA (1984) |
| **4** | Dra. Margaret Hamilton | SP | 196904 | *Já real* | `https://upload.wikimedia.org/wikipedia/commons/d/db/Margaret_Hamilton_-_restoration.jpg` | Retrato restaurado do projeto Apollo 11 (MIT / NASA, 1969) |
| **5** | Dr. Tim Berners-Lee | SP | 198905 | *Já real* | `https://upload.wikimedia.org/wikipedia/commons/4/4e/Sir_Tim_Berners-Lee_%28cropped%29.jpg` | Retrato por Paul Clarke (2014) |
| **6** | Dr. Dennis Ritchie | SP | 197206 | Unsplash genérico (`photo-1622253692010...`) | `https://upload.wikimedia.org/wikipedia/commons/2/23/Dennis_Ritchie_2011.jpg` | Retrato oficial no Prêmio Japão (2011) |
| **7** | Dr. Claude Shannon | RJ | 194807 | Unsplash genérico (`photo-1537368910025...`) | `https://upload.wikimedia.org/wikipedia/commons/c/c1/C.E._Shannon._Tekniska_museet_43069_%282x3_crop%29.jpg` | Acervo histórico do Tekniska Museet |
| **8** | Dra. Katherine Johnson | MG | 196108 | Unsplash genérico (`photo-1594824813589...`) | `https://upload.wikimedia.org/wikipedia/commons/6/6d/Katherine_Johnson_1983.jpg` | Retrato oficial da NASA no Langley Research Center (1983) |
| **9** | Dr. John von Neumann | SP | 194509 | Unsplash genérico (`photo-1582750433449...`) | `https://upload.wikimedia.org/wikipedia/commons/a/a9/John_von_Neumann.jpg` | Retrato de arquivo do Institute for Advanced Study (Princeton) |
| **10** | Dra. Barbara Liskov | RS | 197410 | Unsplash genérico (`photo-1559839734...`) | `https://upload.wikimedia.org/wikipedia/commons/3/38/Barbara_Liskov_MIT_computer_scientist_2010.jpg` | Retrato oficial como Professora do MIT (2010) |
| **11** | Dr. Donald Knuth | PR | 196811 | Unsplash genérico (`photo-1612349317150...`) | `https://upload.wikimedia.org/wikipedia/commons/a/a5/Donald_Ervin_Knuth_%28cropped%29.jpg` | Retrato oficial de Donald Knuth (Stanford, 2005) |
| **12** | Dra. Hedy Lamarr | BA | 194212 | Unsplash genérico (`photo-1651008376811...`) | `https://upload.wikimedia.org/wikipedia/commons/8/83/Hedy_Lamarr_Publicity_Photo_for_The_Heavenly_Body_1944.jpg` | Retrato fotográfico da MGM (1944) |
| **13** | Dr. Linus Torvalds | SC | 199113 | Unsplash genérico (`photo-1622902046580...`) | `https://upload.wikimedia.org/wikipedia/commons/0/01/LinuxCon_Europe_Linus_Torvalds_03_%28cropped%29.jpg` | Retrato na conferência LinuxCon Europe |
| **14** | Dra. Radia Perlman | DF | 198514 | Unsplash genérico (`photo-1594824813689...`) | `https://upload.wikimedia.org/wikipedia/commons/a/af/Radia_Perlman_2009.jpg` | Retrato na Sun Microsystems / Oracle Labs (2009) |
| **15** | Dr. Leslie Lamport | PE | 197815 | Unsplash genérico (`photo-1582750433449...`) | `https://upload.wikimedia.org/wikipedia/commons/5/50/Leslie_Lamport.jpg` | Retrato oficial como pesquisador sênior da Microsoft Research |
| **16** | Dra. Frances Allen | CE | 197116 | Unsplash genérico (`photo-1559839734...`) | `https://upload.wikimedia.org/wikipedia/commons/1/15/Allen_mg_2528-3750K-b.jpg` | Retrato oficial como IBM Fellow e vencedora do Prêmio Turing |
| **17** | Dr. Edgar Codd | GO | 197017 | Unsplash genérico (`photo-1622253692010...`) | `https://upload.wikimedia.org/wikipedia/en/5/58/Edgar_F_Codd.jpg` | Retrato histórico dos arquivos da IBM San Jose Research Lab |

---

## 3. Detalhamento das Alterações Técnicas

### 3.1. Backend (`DataInitializer.java`)
- Atualizar os parâmetros `avatarUrl` das chamadas `seedApprovedDoctor(...)` para os médicos 6 a 17 com as URLs históricas mapeadas acima.
- O método `seedApprovedDoctor` já é idempotente e executa atualização reativa:
  ```java
  doc.setAvatarUrl(avatarUrl);
  userRepository.save(doc);
  ```
  Isso garante que ao reiniciar o backend localmente ou no Render, todos os registros existentes no MongoDB Atlas terão suas fotos migradas automaticamente para as fotos reais sem necessidade de drop de banco ou perda de dados.

### 3.2. Frontend (`AgendarConsultaModal.tsx`)
- Adicionar os atributos `referrerPolicy="no-referrer"` e `crossOrigin="anonymous"` na tag `<img>` do modal de agendamento, alinhando com as diretrizes anti-bloqueio de hotlink já implementadas com sucesso em [`BuscaMedicos.tsx`](../../frontend-react/src/pages/paciente/BuscaMedicos.tsx) e [`DoctorDetailModal.tsx`](../../frontend-react/src/components/paciente/DoctorDetailModal.tsx).

---

## 4. Critérios de Aceite & Validação (BDD)

* **Cenário 1: Visualização dos 17 Médicos na Vitrine de Busca**
  - **Dado** que um paciente acessa a vitrine de telemedicina em `/medicos`
  - **Quando** a lista de médicos cadastrados é renderizada
  - **Então** todos os 17 médicos geriatras exibem suas respectivas fotos históricas reais, sem imagens genéricas repetidas ou avatares quebrados.

* **Cenário 2: Visualização da Foto Real no Modal de Detalhes do Especialista**
  - **Dado** que o paciente clica no card do Dr. Dennis Ritchie ou de qualquer outro médico
  - **Quando** o modal `DoctorDetailModal` é aberto
  - **Então** a foto real do profissional é exibida com alta resolução no cabeçalho do dossiê.

* **Cenário 3: Visualização no Modal de Agendamento de Consulta**
  - **Dado** que o paciente clica em "Agendar Consulta" no card do Dr. Linus Torvalds ou de qualquer especialista
  - **Quando** o modal `AgendarConsultaModal` é exibido
  - **Então** o avatar histórico do especialista é carregado corretamente sem bloqueio de referrer (`referrerPolicy="no-referrer"`).

* **Cenário 4: Idempotência e Atualização Automática no Banco**
  - **Dado** que os usuários médicos já existem na base MongoDB Atlas
  - **Quando** a aplicação sobe e executa o `DataInitializer`
  - **Então** os documentos dos médicos são atualizados com as novas URLs reais, logando `[SEED] Perfil, foto e credenciais atualizados para: {email}`.
