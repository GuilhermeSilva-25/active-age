# 🎓 GUIA DEFINITIVO DE PREPARAÇÃO PARA A BANCA DE LDW
## Laboratório de Desenvolvimento Web — Prof. Edson Saraiva de Almeida
### Projeto: Active Age — Telessaúde Geriátrica Integral
**DSM - 4º Semestre | Fatec Diadema**
**Equipe:** Daniel Felipe Ferreira, Gabriel de Moura, Guilherme Araujo Coelho, Guilherme dos Santos Silva, Johnny da Silva Franco De Lima.

---

> **Aviso Estratégico:** Este guia foi gerado cruzando minuciosamente o conteúdo programático, as referências teóricas e a abordagem pedagógica do **Prof. Edson Saraiva de Almeida** (documento oficial `LDW na 5.pdf`) com a arquitetura real, o código-fonte e as entregas do projeto **Active Age**.
>
> O Prof. Edson avalia com rigor: **fundamentação teórica, padrões de projeto (SOLID), resiliência em sistemas distribuídos (Circuit Breaker/Fallback), design de APIs REST, ciclo de testes (baseado em risco e JaCoCo) e governança ágil no GitHub.**

---

## ÍNDICE RÁPIDO
1. [Engenharia de Requisitos & Gestão Ágil no GitHub](#1-engenharia-de-requisitos--gestão-ágil-no-github)
2. [Arquitetura de Software, Microsserviços & SOLID](#2-arquitetura-de-software-microsserviços--solid)
3. [Resiliência & Estilos de Comunicação entre Microsserviços](#3-resiliência--estilos-de-comunicação-entre-microsserviços)
4. [Design de APIs RESTful, DTOs & Documentação OpenAPI](#4-design-de-apis-restful-dtos--documentação-openapi)
5. [Frontend Moderno com React 19 & Usabilidade Geriátrica (IHC/WCAG)](#5-frontend-moderno-com-react-19--usabilidade-geriátrica-ihcwcag)
6. [Testes de Software, Qualidade & JaCoCo](#6-testes-de-software-qualidade--jacoco)
7. [DevSecOps, CI/CD, Maven & Docker Compose](#7-devsecops-cicd-maven--docker-compose)
8. [Ética Médica, LGPD & Modelo de Negócio](#8-ética-médica-lgpd--modelo-de-negócio)
9. [Matriz de Distribuição de Respostas por Membro da Equipe](#9-matriz-de-distribuição-de-respostas-por-membro-da-equipe)

---

## 1. ENGENHARIA DE REQUISITOS & GESTÃO ÁGIL NO GITHUB

### Pergunta 1.1: *"Por que vocês escolheram o modelo Iterativo e Incremental em vez do modelo Cascata (Waterfall)?"*
* **Fundamento Teórico do Prof. Edson (Cap. 01, p. 4-6):** O modelo Cascata é linear e sequencial, exigindo requisitos congelados no início e só entrega valor no final. Já o modelo iterativo/incremental produz fatias verticais de software funcional a cada ciclo (Sprint), permitindo adaptação contínua e validação precoce de hipóteses.
* **Resposta de Mestre:**
  > *"Professor, no Active Age lidamos com um domínio crítico e sensível — a saúde do idoso. No modelo Cascata, se descobríssemos uma barreira de usabilidade ou um gargalo de conformidade regulatória do CFM apenas na entrega final, o retrabalho seria catastrófico. Com o modelo iterativo incremental dividido em 4 Sprints, entregamos valor funcional verificável em cada iteração: primeiro o consultório virtual e assinatura do médico, depois o checkout e agendamento do paciente, em seguida a gestão e extratos, e por fim a teleconsulta WebRTC em tempo real. Cada Sprint gerou um incremento testado e auditado."*

### Pergunta 1.2: *"Como foram estruturadas as Histórias de Usuário e os Critérios de Aceitação da equipe?"*
* **Fundamento Teórico do Prof. Edson (Cap. 01, p. 7-8, 24, 28):** Padrão formal *"Como [persona], eu quero [ação], para que [benefício de negócio]"*, complementado com critérios de aceitação BDD (*Dado que / Quando / Então*) e tabela de campos/regras de validação.
* **Resposta de Mestre:**
  > *"Seguimos à risca o padrão preconizado na disciplina. Para cada funcionalidade criamos uma User Story especificando o ator (o Sr. Antônio idoso, a Mariana filha/cuidadora, o Dr. Roberto geriatra ou o Carlos administrador), a intenção e o valor agregado. Definimos cenários em BDD — 'Dado que o paciente selecionou um horário livre, Quando ele confirmar o pagamento por Pix, Então a consulta é confirmada atomicamente e o slot é bloqueado' —, além de mantermos o checklist técnico cobrindo rotas, DTOs de validação e testes automatizados."*

### Pergunta 1.3: *"Como vocês utilizaram o GitHub Projects, Milestones e a métrica de Velocidade (Team Velocity)?"*
* **Fundamento Teórico do Prof. Edson (Cap. 01, p. 20-29):** Kanban com automações (Move to Done ao fechar PR), Issues/Drafts, Labels, Milestones mapeados para Sprints, T-Shirt sizing para complexidade e Story Points com sequência de Fibonacci no campo *Estimate* para calcular a velocidade média da equipe.
* **Resposta de Mestre:**
  > *"Mapeamos as 4 Sprints em Milestones no GitHub. Usamos o GitHub Projects com quadro Kanban customizado contendo Backlog, Todo, In Progress, Review/Test e Done, com workflows automáticos que movimentavam as issues quando os Pull Requests eram aprovados. Estimamos as tarefas com Story Points (Fibonacci) no campo Estimate, o que nos permitiu monitorar a velocidade de entrega da equipe e planejar a capacidade das iterações subsequentes sem sobrecarga."*

---

## 2. ARQUITETURA DE SOFTWARE, MICROSSERVIÇOS & SOLID

### Pergunta 2.1: *"Qual o estilo arquitetural do Active Age e qual a justificativa para a separação em microsserviços?"*
* **Fundamento Teórico do Prof. Edson (Cap. 01, p. 9-11; Cap. 04, p. 50-52; Newman/Richardson):** O monólito concentra tudo num único processo com acoplamento de runtime; microsserviços dividem responsabilidades de negócio em serviços autônomos, com tecnologias adequadas a cada domínio, tolerância a falhas isolada e deploy independente.
* **Resposta de Mestre:**
  > *"Adotamos uma arquitetura modular orientada a microsserviços especializada por domínios de negócio:
  > 1. **Backend Core (Java 21 / Spring Boot 3):** gerencia o domínio de saúde, prontuários imutáveis, usuários, agendamentos e regras éticas do CFM;
  > 2. **MS Pagamento & Faturamento (Java 21 / Spring Boot 3 / H2 / JPA):** gerencia as transações financeiras, checkout Pix/Cartão, repasses sem dicotomia e assinaturas SaaS;
  > 3. **MS WebRTC Signaling (Node.js):** gerencia a sinalização de áudio e vídeo em tempo real via WebSockets;
  > 4. **Frontend SPA (React 19 / Vite):** experiência unificada do usuário.
  > A principal justificativa é a **resiliência e a não propagação de falhas**: se o tráfego da videochamada oscilar ou o gateway de pagamentos externo apresentar instabilidade, o núcleo da plataforma de agendamento e emissão de receitas continua 100% disponível."*

### Pergunta 2.2: *"Como o princípio DIP (Inversão de Dependência) e a Programação Orientada a Interfaces foram aplicados no projeto?"*
* **Fundamento Teórico do Prof. Edson (Cap. 01, p. 11-13; Cap. 02, p. 36-37; Robert Martin):** Módulos de alto nível não devem depender de módulos de baixo nível; ambos devem depender de abstrações/interfaces. A implementação concreta é injetada via IoC.
* **Resposta de Mestre:**
  > *"O DIP foi aplicado de forma exemplar no módulo de pagamentos e nos serviços de negócios. No microsserviço de pagamento, as regras da aplicação não conhecem a API concreta do Mercado Pago; elas dependem de uma interface genérica de serviço de pagamento (`IPagamentoGateway`). O SDK ou client HTTP do Mercado Pago é apenas um adaptador de infraestrutura que implementa essa interface. Se amanhã a plataforma decidir integrar com o Banco do Brasil, Asaas ou utilizar um Mock para testes locais sem custo financeiro, a camada de regras de negócio permanece intacta, respeitando também o Princípio Aberto/Fechado (OCP)."*

### Pergunta 2.3: *"Expliquem como o Princípio da Responsabilidade Única (SRP) se reflete nas camadas do Spring Boot."*
* **Fundamento Teórico do Prof. Edson (Cap. 01, p. 12; Cap. 02, p. 32):** Cada classe deve ter uma única razão para mudar. Separação rígida entre Apresentação (`@RestController`), Negócio (`@Service`) e Persistência (`@Repository`).
* **Resposta de Mestre:**
  > *"No backend, cada camada tem responsabilidade delimitada:
  > - O **`@RestController`** atua estritamente na recepção da requisição HTTP, validação de payload (via DTOs e Jakarta Bean Validation) e serialização da resposta com o código de status HTTP correto;
  > - O **`@Service`** contém as regras de negócio puras (ex.: validação de horário livre, hash criptográfico SHA-256 do prontuário, checagem de CRM ativo);
  > - O **`@Repository`** é o único responsável pela comunicação com o banco de dados.
  > Nenhuma regra de negócio vaza para o controller e o controller nunca acessa diretamente o repositório."*

---

## 3. RESILIÊNCIA & ESTILOS DE COMUNICAÇÃO ENTRE MICROSSERVIÇOS

### Pergunta 3.1: *"Como foi tratada a latência e a indisponibilidade na comunicação entre microsserviços e APIs externas? Vocês usaram Circuit Breaker e Fallback?"*
* **Fundamento Teórico do Prof. Edson (Cap. 04, p. 51-52):** Em chamadas síncronas diretas, a indisponibilidade ou lentidão externa causa retenção de threads e derruba a aplicação cliente em cascata. O padrão **Circuit Breaker** (Fechado, Aberto, Meio-Aberto) protege a aplicação, e o **Fallback** oferece resposta de contingência.
* **Resposta de Mestre:**
  > *"Sim, professor! No microsserviço de pagamentos (`ms-pagamento-faturamento`), integramos a biblioteca **Resilience4j** configurando o padrão **Circuit Breaker** com **Fallback** para a comunicação com a API do Mercado Pago:
  > - **Estado Fechado (Closed):** requisições trafegam normalmente monitorando a taxa de sucesso;
  > - **Estado Aberto (Open):** se a taxa de timeout ou erro 5xx ultrapassar o limiar tolerado, o circuito abre imediatamente, desarmando as chamadas para não esgotar o pool de threads do Tomcat;
  > - **Fallback:** quando o circuito está aberto, o sistema aciona o método de contingência, gerando uma resposta segura informando a indisponibilidade temporária do gateway externo e permitindo a retentativa controlada;
  > - **Estado Meio-Aberto (Half-Open):** após o tempo de espera configurado, requisições de teste são autorizadas para validar a recuperação do gateway antes de normalizar o fluxo.
  > Além disso, utilizamos **Caching Local em memória (Caffeine)** para dados de consulta frequente e baixa mutabilidade, eliminando latência de rede desnecessária."*

### Pergunta 3.2: *"Qual a diferença entre a comunicação síncrona adotada e um modelo assíncrono por barramento de eventos (Message Broker / JMS)?"*
* **Fundamento Teórico do Prof. Edson (Cap. 04, p. 50, 52-53):** Síncrono (Request/Response REST) bloqueia a thread aguardando resposta imediata (ideal para formulários e operações atômicas); Assíncrono (Event Bus / Broker como RabbitMQ, Kafka, JMS) desacopla temporalmente o produtor do consumidor via filas ou tópicos (Pub/Sub).
* **Resposta de Mestre:**
  > *"Para o fluxo de checkout e confirmação imediata da consulta, a comunicação síncrona REST é mandatória para fornecer feedback em tempo real ao idoso na interface ('Seu pagamento foi confirmado!'). Contudo, compreendemos perfeitamente o valor do desacoplamento assíncrono: para o 5º semestre, nossa arquitetura já prevê a introdução de um **microsserviço de mensageria assíncrono** operando como consumidor de tópicos/filas para envio de lembretes automáticos de consulta, notificações por WhatsApp/SMS e push notifications para o aplicativo mobile, sem onerar as threads do backend core."*

---

## 4. DESIGN DE APIS RESTFUL, DTOS & DOCUMENTAÇÃO OPENAPI

### Pergunta 4.1: *"Quais boas práticas de design de APIs RESTful foram seguidas nos endpoints do Active Age?"*
* **Fundamento Teórico do Prof. Edson (Cap. 02, p. 32-34):** Uso de substantivos no plural em minúsculo (`/api/consultas`, `/api/medicos`), verbos HTTP semânticos (GET para leitura, POST para criação, PUT para atualização total, DELETE para remoção), evitar verbos na URL (`POST /consultas/criar` é má prática) e uso rigoroso dos Status Codes.
* **Resposta de Mestre:**
  > *"Seguimos os padrões RESTful universais:
  > - Nossos endpoints utilizam **substantivos no plural e minúsculo**, como `/api/doctors`, `/api/appointments`, `/api/prescriptions`;
  > - Usamos os métodos HTTP para expressar a ação sem verbos na URL: `POST` para criar consulta, `GET` para listar horários, `DELETE` para cancelamento;
  > - Mapeamos os **Status Codes HTTP semanticamente**: `200 OK` para consultas, `201 Created` com cabeçalho `Location` para novos cadastros, `204 No Content` para exclusões bem-sucedidas, `400 Bad Request` com corpo padronizado via `GlobalExceptionHandler` para erros de validação, `401 Unauthorized` e `403 Forbidden` no Spring Security, e `409 Conflict` em caso de concorrência de agendamento."*

### Pergunta 4.2: *"Por que utilizar DTOs (Data Transfer Objects) e não expor as entidades de domínio diretamente nos controllers?"*
* **Fundamento Teórico do Prof. Edson (Cap. 02, p. 35-37):** DTOs isolam o modelo interno de banco de dados do contrato da API externa, evitam vazamento de dados sensíveis (senhas, dados financeiros), previnem ataques de Mass Assignment e permitem validações Jakarta personalizadas por operação.
* **Resposta de Mestre:**
  > *"Utilizamos Records e classes DTO dedicadas para cada operação de entrada e saída (ex: `DoctorRegisterRequest`, `AppointmentBookingDTO`, `PrescriptionResponseDTO`). Isso garante três pilares:
  > 1. **Segurança e LGPD:** jamais trafegamos a entidade `User` crua, evitando o vazamento acidental de campos como o hash BCrypt da senha ou dados bancários do médico;
  > 2. **Validação na Borda:** anotamos os DTOs com Jakarta Validation (`@NotBlank`, `@Email`, `@Pattern`), interceptando dados inválidos antes mesmo de tocar a camada de serviço;
  > 3. **Desacoplamento:** o schema do banco de dados pode evoluir internamente sem quebrar os clientes que consomem a API pública."*

### Pergunta 4.3: *"Como a API está documentada? Vocês utilizaram Swagger / OpenAPI?"*
* **Fundamento Teórico do Prof. Edson (Cap. 02, p. 38-39):** O padrão OpenAPI 3 com `springdoc-openapi` gera documentação viva, navegável e testável via Swagger UI em `/swagger-ui/index.html`.
* **Resposta de Mestre:**
  > *"A API do Active Age é 100% documentada com **OpenAPI 3 / Swagger**, acessível publicamente na rota oficial do nosso backend (`/swagger-ui/index.html`). Todos os endpoints, parâmetros de requisição, esquemas de DTOs e códigos de resposta HTTP possíveis estão mapeados com anotações do Swagger, permitindo que desenvolvedores e avaliadores testem os serviços interativamente direto no navegador."*

---

## 5. FRONTEND MODERNO COM REACT 19 & USABILIDADE GERIÁTRICA (IHC/WCAG)

### Pergunta 5.1: *"Como funciona a renderização no React, o Virtual DOM e o algoritmo de Diffing?"*
* **Fundamento Teórico do Prof. Edson (Cap. 03, p. 43-46):** O navegador manipula o DOM real, que é custoso computacionalmente. O React cria uma representação em memória (Virtual DOM). A cada alteração de estado, gera um novo snapshot, compara com o anterior via algoritmo de Diffing e atualiza no DOM real apenas os nós que sofreram mutação.
* **Resposta de Mestre:**
  > *"O React trabalha com o Virtual DOM. Quando o estado da aplicação muda — por exemplo, quando a Dona Maria seleciona um slot de consulta —, o React gera um novo snapshot da árvore de componentes em memória. O algoritmo de **Diffing** compara a nova árvore com a anterior e identifica cirurgicamente apenas os elementos que foram alterados, aplicando essas alterações em lote (batching) no Real DOM do navegador. Isso garante alta performance, zero piscamento de tela e fluidez, essencial para a sensibilidade visual de um paciente idoso."*

### Pergunta 5.2: *"Como o estado da aplicação foi gerenciado no frontend? O que é State Lifting?"*
* **Fundamento Teórico do Prof. Edson (Cap. 03, p. 47-48):** Estado local (`useState`) gerencia a memória temporária do componente. Quando dois ou mais componentes irmãos precisam compartilhar ou reagir ao mesmo dado, 'eleva-se o estado' (*State Lifting*) para o componente pai comum, que repassa os dados via props e a função de atualização via callbacks.
* **Resposta de Mestre:**
  > *"Utilizamos `useState` para controle local (como campos de formulários e estados de modais) e aplicamos o padrão de **State Lifting (Elevação de Estado)** nas jornadas integradas. Por exemplo, no Cockpit de Teleconsulta (`TeleconsultaRoom.tsx`), o componente pai gerencia o estado da consulta e dos exames anexados, compartilhando as informações tanto para a janela de vídeo WebRTC quanto para a aba de prontuário e emissão de receitas médicas."*

### Pergunta 5.3: *"Quais cuidados de IHC (Interação Humano-Computador) e acessibilidade WCAG foram implementados especificamente para a terceira idade?"*
* **Fundamento Teórico do Prof. Edson & Normas de Acessibilidade:** WCAG 2.1 AA, contraste adequado, eliminação de caixas de diálogo bloqueantes do navegador (`window.alert`), botões táteis ampliados e mensagens de erro acolhedoras.
* **Resposta de Mestre:**
  > *"Eliminamos 100% dos `window.alert()`, `confirm()` ou `prompt()` do navegador, que geram confusão no público idoso. Desenvolvemos o componente universal **`FeedbackModal.tsx`**, com botões grandes de toque, contraste aprovado pela WCAG 2.1 AA, ícones semânticos da Lucide e linguagem acolhedora. Além disso, criamos o hook **`useBodyScrollLock`** para garantir rolagem interna em todos os modais, colocamos a próxima consulta do idoso em destaque no topo da tela inicial e simplificamos a entrada na sala de teleconsulta com um único clique, sem necessidade de login em aplicativos de terceiros."*

---

## 6. TESTES DE SOFTWARE, QUALIDADE & JACOCO

### Pergunta 6.1: *"O que é o teste baseado no risco de falha do produto e como ele guiou a estratégia de testes da equipe?"*
* **Fundamento Teórico do Prof. Edson (Cap. 01, p. 16):** Teste baseado em risco avalia a probabilidade de falha versus a severidade do impacto no negócio. Recursos com risco alto (ex: cálculos financeiros, prontuário médico, autenticação) recebem prioridade máxima de cobertura e profundidade de testes.
* **Resposta de Mestre:**
  > *"Na área da saúde e pagamentos, o risco de impacto é crítico: uma falha em um cálculo de repasse ou na alteração indevida de um prontuário médico pode acarretar sanções éticas do CFM e perdas financeiras. Por isso, adotamos o teste baseado no risco:
  > - **Risco Crítico (Alta Probabilidade / Severo Impacto):** Autenticação RBAC, bloqueio de contas inativas, cálculo de Split do Mercado Pago, immutabilidade do Prontuário com SHA-256 e agendamento concorrente sem double-booking receberam testes unitários e de integração com cobertura total;
  > - **Risco Baixo/Médio:** DTOs simples e formatadores de apresentação receberam testes funcionais complementares."*

### Pergunta 6.2: *"Qual foi a cobertura de testes alcançada e quais ferramentas foram utilizadas?"*
* **Fundamento Teórico do Prof. Edson (Cap. 01, p. 16, 30; Cap. 02, p. 30):** JUnit 5 para asserções unitárias, Mockito para isolamento de dependências, MockMvc para testes de integração de controllers sem subir servidor real e JaCoCo para métrica formal de cobertura de código.
* **Resposta de Mestre:**
  > *"Alcançamos uma blindagem de altíssimo nível:
  > - **Mais de 230 testes automatizados em todo o repositório** (184 testes no Backend Core, 39 testes no MS de Pagamentos e 10 testes no MS de WebRTC Signaling, com **0 falhas**);
  > - **Cobertura JaCoCo superior a 84% de instruções e 100% das classes de exceção e utils no Core**, com 100% dos 14 controladores RESTful validados via **MockMvc** e serviços isolados com **Mockito**;
  > - Relatórios HTML e XML do JaCoCo gerados automaticamente e disponibilizados na esteira de CI/CD a cada push."*

---

## 7. DEVSECOPS, CI/CD, MAVEN & DOCKER COMPOSE

### Pergunta 7.1: *"Como funciona o ciclo de vida do Apache Maven (Maven Lifecycle) no backend de vocês?"*
* **Fundamento Teórico do Prof. Edson (Cap. 02, p. 30-31):** O ciclo default executa fases sequenciais rígidas: `validate` -> `compile` -> `test` -> `package` -> `verify` -> `install` -> `deploy`. O comando `clean` limpa artefatos antigos no diretório `/target`.
* **Resposta de Mestre:**
  > *"Utilizamos o Maven gerenciando as dependências através do `pom.xml`. No nosso pipeline e no desenvolvimento diário, executamos o ciclo rigoroso:
  > 1. **`clean`:** expurga arquivos compilados anteriores da pasta `target/` para evitar efeitos colaterais de builds residuais;
  > 2. **`compile`:** valida a tipagem e compila o código-fonte Java 21;
  > 3. **`test`:** dispara os testes unitários do JUnit 5 e gera os relatórios de cobertura do JaCoCo;
  > 4. **`package`:** empacota a aplicação em um executável autônomo `.jar` com servidor Tomcat embutido, pronto para execução em contêineres."*

### Pergunta 7.2: *"Como está desenhada a esteira de CI/CD da equipe no GitHub Actions?"*
* **Fundamento Teórico do Prof. Edson (Cap. 01, p. 30; Cap. 05, p. 54-60):** Automação em esteira de integração contínua disparada a cada push/pull request, executando testes em paralelo, auditorias de segurança e gerando artefatos versionados.
* **Resposta de Mestre:**
  > *"Nossa esteira no GitHub Actions foi estruturada em duas grandes etapas:
  > - **Etapa 1 (Matriz Paralela em menos de 1 minuto):** dispara 4 baterias de testes simultâneas para o Backend Core (Java 21/Maven), Frontend SPA (React 19/Vite/Linter), MS Signaling (Node.js) e MS Pagamento (Java 21/Resilience4j);
  > - **Etapa 2 (DevSecOps & Docker):** somente após 100% dos testes passarem, o pipeline executa o **scanner de segurança Trivy** contra vulnerabilidades conhecidas (CVEs) e constrói as imagens Docker multi-stage, publicando-as no GitHub Container Registry (`ghcr.io`)."*

### Pergunta 7.3: *"Como a orquestração de contêineres foi resolvida com Docker Compose e Nginx?"*
* **Fundamento Teórico do Prof. Edson (Cap. 01, p. 18-19; Cap. 04):** Uso de Docker Compose para subir todo o ecossistema multi-serviço em uma rede virtual isolada, com Nginx atuando como proxy reverso para distribuição de requisições e isolamento de portas internas.
* **Resposta de Mestre:**
  > *"Desenvolvemos um arquivo `docker-compose.yml` que orquestra os 4 serviços na rede interna virtual `active-age-net`:
  > - O Frontend SPA é construído em multi-stage build e servido através do **Nginx Alpine**, que também atua como proxy reverso roteando as chamadas `/api` diretamente para os backends sem expor portas desnecessárias ao ambiente externo;
  > - O Backend Core, o MS de Pagamentos e o Signaling sobem com variáveis de ambiente injetadas de forma desacoplada, permitindo que a aplicação completa seja executada em qualquer máquina com um único comando `docker compose up --build`."*

---

## 8. ÉTICA MÉDICA, LGPD & MODELO DE NEGÓCIO

### Pergunta 8.1: *"Como vocês garantem conformidade com as Resoluções do CFM (Conselho Federal de Medicina) no modelo de negócios?"*
* **Fundamento Ético e Regulatório (CFM Res. nº 2.314/2022 e 2.336/2023):** É estritamente vedada a dicotomia (cobrança de comissão percentual sobre honorários médicos por intermediadores) e o ranking com estrelas de avaliação.
* **Resposta de Mestre:**
  > *"O modelo de negócios do Active Age foi construído respeitando a ética médica inegociável do CFM:
  > - **Split Direto Sem Dicotomia:** a plataforma cobra uma assinatura SaaS fixa mensal pelo uso da infraestrutura do consultório virtual (R$ 149,90/mês). O valor da consulta do paciente cai 100% na conta bancária do médico no gateway regulado, sem retenção de comissão percentual por parte da Active Age;
  > - **Vitrine Neutra:** a busca de médicos não possui leilão de lances, destaque pago ou avaliações subjetivas de estrelas, exibindo apenas dados informativos, especialidades e habilitação perante o CRM."*

### Pergunta 8.2: *"De que forma o Prontuário Eletrônico e as Receitas Digitais atendem às exigências legais e à LGPD?"*
* **Fundamento Regulatório (CFM, SBIS NGS1/NGS2, Lei 14.510/2022 e LGPD):** Prontuário médico é imutável após assinatura e exige integridade física e rastreabilidade temporal. Prescrições exigem identificador único de autenticidade perante ICP-Brasil/CRM.
* **Resposta de Mestre:**
  > *"Implementamos garantias criptográficas e legais:
  > - **Prontuário Imutável com Hash SHA-256:** após a finalização da teleconsulta, o prontuário clínico é lacrado. O sistema calcula um hash criptográfico SHA-256 e registra a data/hora exata, tornando o registro imutável perante a auditoria;
  > - **Receituário Digital ICP-Brasil:** as prescrições e atestados emitidos geram um código de controle unívoco (`AA-2026-XXXXXX`) que pode ser validado publicamente na rota `/validar-documento` por farmácias e pacientes;
  > - **LGPD & Trilha de Auditoria:** todo acesso, login, agendamento e emissão de dados sensíveis de saúde é registrado na coleção imutável `audit_logs`, garantindo rastreabilidade completa e sigilo médico."*

---

## 9. MATRIZ DE DISTRIBUIÇÃO DE RESPOSTAS POR MEMBRO DA EQUIPE

Para a apresentação de amanhã, combinem a distribuição das respostas para que todos os 5 membros falem e demonstrem domínio técnico individual:

| Membro | Especialidade na Apresentação | Perguntas Foco para Responder na Banca |
| :--- | :--- | :--- |
| **Guilherme Silva** *(PO & Tech Lead)* | Propósito, Regulação, Arquitetura Geral & Visão Executiva | **Perguntas 1.1, 2.1 e 8.1 / 8.2** *(Por que microsserviços, modelo iterativo, ética CFM, LGPD e orquestração do projeto)* |
| **Gabriel** | Modelo de Negócios (Canvas), Personas & Sustentabilidade | **Perguntas 1.2 e 8.1** *(Histórias de Usuário, Personas do Sr. Antônio/Dr. Roberto e Split Direto do Mercado Pago)* |
| **Daniel** | Engenharia de Software, SOLID, Design de APIs REST & Stack | **Perguntas 2.2, 2.3 e 4.1 / 4.2 / 4.3** *(DIP/SOLID, Camadas Controller-Service-Repository, DTOs e Swagger OpenAPI)* |
| **Johnny** | CI/CD, DevSecOps, Testes de Risco, Maven & Docker | **Perguntas 6.1, 6.2 e 7.1 / 7.2 / 7.3** *(Testes baseados em risco, JaCoCo, ciclo Maven, GitHub Actions e Docker Compose)* |
| **Guilherme Araujo** | Resultados das 4 Sprints, Resiliência & Teleconsulta WebRTC | **Perguntas 3.1, 3.2 e 5.1 / 5.2 / 5.3** *(Circuit Breaker com Resilience4j, Fallback, WebRTC e usabilidade WCAG no React)* |

---

> [!TIP]
> **Postura de Vencedores na Banca:**
> 1. Respondam sempre com calma e segurança: *"Excelente pergunta, professor..."*;
> 2. Citem os nomes dos padrões: *DIP, Circuit Breaker, Resilience4j, Virtual DOM, BDD, JaCoCo, OpenAPI 3, WCAG 2.1 AA*;
> 3. Caso o professor aponte algo que possa melhorar no 5º semestre, usem a frase mágica: *"Exatamente, professor. Inclusive já mapeamos essa evolução no nosso Backlog de Arquitetura para o 5º semestre com o microsserviço assíncrono de mensageria e o app mobile."*
