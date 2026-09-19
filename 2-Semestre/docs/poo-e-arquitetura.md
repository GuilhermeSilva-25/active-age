# 🏗️ POO e Arquitetura de Software

O Back-End do Active Age no 2º Semestre foi totalmente construído utilizando **TypeScript**, garantindo tipagem estática rigorosa e a aplicação prática dos pilares da **Programação Orientada a Objetos (POO)** exigidos pela disciplina de Técnicas de Programação I.

## 🏛️ Padrão Arquitetural: MVC (Model-View-Controller)
A aplicação está organizada no padrão MVC para separar a lógica de apresentação, das regras de negócio e manipulação de dados:

* **View:** As páginas estáticas criadas no 1º Semestre (HTML/JS) que fazem requisições à API.
* **Controller:** Classes TS (ex: `AgendamentoController`) responsáveis por receber as requisições HTTP (Express.js), validar payloads de entrada e acionar as regras de negócio.
* **Model:** Classes que representam as entidades de domínio e os Repositórios que contêm os comandos SQL (Data Access Object - DAO) comunicando-se com o MySQL.

---

## 🧬 Pilares da POO Aplicados no TypeScript

### 1. Abstração e Herança
A tabela de usuários no banco de dados reflete uma lógica clássica de Orientação a Objetos. 
* Criamos uma classe abstrata `Usuario` contendo propriedades comuns (`id`, `nome`, `email`, `senha`) e métodos-base de validação. 
* As classes `Medico` e `Paciente` utilizam a palavra-chave `extends Usuario`, herdando esses campos genéricos e implementando os seus próprios atributos exclusivos (como `crm` para o médico e `dataNascimento` para o paciente).

### 2. Encapsulamento
No TypeScript, utilizamos extensamente os modificadores de acesso:
* `private`: As credenciais de banco de dados e os identificadores de sessão ficam ocultos.
* `protected`: Atributos da classe pai acessíveis apenas pelas classes filhas.
* Alterações no estado (exemplo: mudar o status de um Agendamento) só ocorrem por meio de métodos de negócio (ex: `agendamento.cancelarConsulta()`), e nunca acessando a propriedade diretamente (`agendamento.status = 'CANCELADO'`).

### 3. Polimorfismo
A interface `IUsuarioAuth` declara o método de autenticação e de direcionamento. Quando o Login ocorre, tanto instâncias de Pacientes quanto de Médicos respondem ao método genérico `getDashboardRoute()`, porém com comportamentos polimórficos:
* O Paciente devolve a URL estática: `/dashboard-paciente.html`.
* O Médico devolve a URL estática: `/dashboard-medico.html`.

