# 🏗️ Arquitetura e Stack Tecnológica

Este documento descreve as decisões de System Design, infraestrutura e as ferramentas escolhidas para o desenvolvimento do **Active Age** no 3º Semestre. A arquitetura foi desenhada para garantir escalabilidade, segurança e fácil manutenção, seguindo os princípios **SOLID**.

## 1. Stack Tecnológica

| Camada | Tecnologia Principal | Hospedagem | Descrição |
|---|---|---|---|
| **Front-End** | **React + Vite** (TypeScript) | **Vercel** | Aplicação construída como SPA (Single Page Application). Vite é utilizado pelo tempo de *build* ultrarrápido. TypeScript garante segurança de tipagem. |
| **Back-End** | **Java 21 + Spring Boot** | **Railway** | API RESTful responsável pelo *Core Domain*. Utiliza os módulos Spring Web, Spring Security e Spring Data. |
| **Banco de Dados** | **MongoDB** (NoSQL) | **Mongo Atlas** | Banco orientado a documentos (JSON/BSON), permitindo flexibilidade na estruturação de prontuários médicos e armazenamento de arquivos via *GridFS*. |

## 2. Visão Lógica (Arquitetura do Back-End)

O Back-End central (Spring Boot) segue o padrão arquitetural em camadas **MVC + Service Layer + Repository Pattern**:

1. **Camada de Apresentação (Controllers):** Recebe requisições HTTP do Front-End, valida as entradas (DTOs) e devolve as respostas JSON documentadas nativamente pelo Swagger (`springdoc-openapi`).
2. **Camada de Serviço (Services):** Coração do sistema. Onde as Regras de Negócio (RN) são validadas e executadas (ex: verificação de concorrência de agenda, cálculos de antecedência de cancelamento).
3. **Camada de Domínio (Entities):** Representação das classes de negócio mapeadas para os documentos do MongoDB.
4. **Camada de Persistência (Repositories):** Interfaces do Spring Data abstraindo as consultas e comandos diretos ao banco de dados.

## 3. Arquitetura de Microsserviços (Integrações Externas)

Para proteger o sistema principal (Monolito Core) contra *timeouts* e sobrecarga de processamento, integrações pesadas ou de terceiros serão isoladas:
* **Módulo de Vídeo (Telemedicina):** A comunicação de áudio/vídeo pesada **não** passa pelo servidor do Railway. O Back-End apenas se comunica com uma API externa via Microsserviço/Adapter para gerar e autenticar os links das salas virtuais exclusivas.
* **Módulo de Geração de PDF e Assinatura:** O processamento pesado de transformar dados HTML/JSON em arquivos PDF (Receitas e Atestados) pode ser isolado para não bloquear o *Thread Pool* do Spring.
* **Gateway de Pagamento:** Processamento financeiro (PCI-Compliance) delegado a *webhooks* e APIs de gateways consolidados.

## 4. Segurança e Qualidade (Q.A)

* **Autenticação StateLess (JWT):** O servidor não armazena sessões. A autenticação é feita via token JWT trafegado de forma segura, acoplado com controle de rotas por perfis (Role-Based Access Control).
* **Criptografia:** Algoritmo **BCrypt** (hash irreversível) obrigatório para todas as senhas armazenadas no banco.
* **Testes Automatizados:** Cobertura de rotas e regras críticas garantida por **JUnit 5 + Mockito** (Back-End) e **Jest + React Testing Library** (Front-End). A abordagem incentiva o TDD (Test-Driven Development).

