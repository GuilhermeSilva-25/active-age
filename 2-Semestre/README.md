# 💻 2º Semestre: Motor Relacional e Lógica Orientada a Objetos

**Status: Concluído** ✅

## 🎯 Objetivo
Dar vida ao Active Age construindo o Back-End orientado a objetos e integrando-o a um banco de dados relacional (MySQL). O foco principal deste semestre foi implementar o fluxo de Autenticação real, construir uma API REST completa seguindo o padrão MVC para o sistema de agendamentos e conectar o motor de retaguarda (back-end) com as interfaces estáticas desenvolvidas no 1º Semestre.

## 🛠️ Disciplinas Integradas
* Técnicas de Programação I (TypeScript, Node.js e POO)
* Banco de Dados Relacional (MySQL e SQL)
* Engenharia de Software II (Arquitetura e MVC)
* Desenvolvimento Web II (Integração Front-Back via APIs)

## 📦 Entregas Realizadas

### 1. API REST & Arquitetura MVC (`/src`)
* Construção de servidor backend nativo utilizando **Node.js, Express e TypeScript**.
* **Models (POO):** Estrutura forte utilizando Classes Abstratas (`Usuario`), Herança (`Medico`, `Paciente`), encapsulamento e comportamentos polimórficos (`getDashboardRoute()`).
* **Controllers:** Orquestração de requisições web e regras de negócios com as classes `AuthController`, `AgendamentoController` e `HorarioController`.
* **Documentação Técnica:** Todo o código Typescript e Javascript está minuciosamente documentado seguindo os padrões do mercado com **JSDoc/TSDoc** e focado em documentar Regras de Negócio explícitas.

### 2. Banco de Dados Relacional (`/database`)
* Utilização de **Docker Compose** para orquestrar a infraestrutura de Banco de Dados.
* Estrutura de tabelas normalizadas para refletir a Herança de POO (`usuarios`, `medicos` e `pacientes`).
* Novo fluxo transacional robusto envolvendo horários:
  * Criação da tabela `horarios_disponiveis` (Médico como dono da agenda).
  * Chaves estrangeiras conectadas com a tabela de `agendamentos`.
* **Seeding Dinâmico:** Um script de inicialização (`seed.sql`) preparado em UTF-8 (utf8mb4) contendo contas fictícias inspiradas nas grandes lendas da tecnologia (Dra. Ada Lovelace, Dr. Alan Turing, Dr. Linus Torvalds) já preenchidas com horários de amostra.

### 3. Integração Inteligente Front-End (`/public`)
* Remoção dos mocks locais (localStorage do 1º Semestre) e implementação da biblioteca nativa `Fetch API` para conectar telas em HTML/JS puro diretamente à API TypeScript.
* **Agendamento Real-Time simulado:** 
  * Selects do paciente povoados através da consulta no banco de dados.
  * Lógica avançada de "Vitrine de Agendamentos": quando o paciente conclui a reserva, o horário "desaparece" em tempo real para os outros. O médico tem painel exclusivo onde pode remover seus próprios horários.

## 🚀 Como executar o projeto

Certifique-se de possuir **Docker** e **Node.js** (v20 ou superior) instalados.

1. **Subir a Infraestrutura:**
   Abra o seu terminal na pasta `/2-Semestre` e ligue o container do MySQL:
   ```bash
   docker compose up -d
   ```

2. **Injetar a Estrutura e os Dados Falsos:**
   No Windows (PowerShell):
   ```powershell
   Get-Content database\schema.sql | docker exec -i mysql_active_age mysql -uroot -proot active_age
   Get-Content database\refatoracao.sql | docker exec -i mysql_active_age mysql -uroot -proot active_age
   Get-Content database\seed.sql | docker exec -i mysql_active_age mysql -uroot -proot active_age --default-character-set=utf8mb4
   ```

3. **Iniciar o Back-End:**
   Instale as dependências da aplicação e rode o servidor de desenvolvimento:
   ```bash
   npm install
   npm run dev
   ```

4. **Acessar a Aplicação:**
   Abra o seu navegador de preferência e entre na plataforma web:
   **[http://localhost:3000](http://localhost:3000)**

---

## 📄 Documentação Detalhada
Para mergulhar nos aspectos técnicos específicos exigidos pelas matérias do Semestre, consulte a documentação oficial na pasta de documentos:
- [Modelagem de Banco de Dados (MySQL)](./docs/banco-de-dados.md)
- [POO, MVC e Arquitetura (TypeScript)](./docs/poo-e-arquitetura.md)
- [Diagramas UML e Fluxos](./docs/uml-e-fluxos.md)
