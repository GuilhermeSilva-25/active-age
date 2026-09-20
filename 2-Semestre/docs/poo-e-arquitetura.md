# 🧱 POO e Arquitetura de Software

O Back-End do Active Age no 2º Semestre foi totalmente construído utilizando **TypeScript**, garantindo tipagem estática rigorosa e a aplicação prática dos pilares da **Programação Orientada a Objetos (POO)** exigidos pela disciplina de Técnicas de Programação I.

## 🏗️ Padrão Arquitetural: MVC (Model-View-Controller)
A aplicação está minuciosamente organizada no padrão MVC para isolar as responsabilidades:

* **View:** Componentizada nos HTMLs e arquivos estáticos localizados em `/public`. Recebem injeção de dados via `Fetch API`.
* **Controller:** Classes TypeScript na pasta `/src/controllers` (ex: `AgendamentoController`, `AuthController`) que representam a camada de Negócios e controle de Tráfego do Node/Express.
* **Model:** Classes na pasta `/src/models` que espelham perfeitamente o comportamento e as identidades descritas nas tabelas do Banco de Dados, unindo lógica estruturada à POO.

---

## 🧬 Pilares da POO Aplicados no TypeScript

### 1. Abstração e Herança
A engenharia de tabelas do banco de dados reflete uma lógica clássica de Orientação a Objetos no servidor.
* Criamos uma **classe abstrata** `Usuario` contendo propriedades globais (`id`, `nome`, `email`, `senha`) e métodos-base.
* As classes `Medico` e `Paciente` utilizam a palavra-chave `extends Usuario`, herdando esses campos genéricos e implementando comportamentos exclusivos (como buscar crm e recuperar a data de nascimento).

### 2. Encapsulamento
Utilizamos intensivamente o bloqueio de atributos utilizando os Modificadores de Acesso do TypeScript:
* `private`: Todos os dados sigilosos e internos (CRM, Aniversário) ficam fechados, só podem ser recuperados através de métodos `getters` públicos.
* `protected`: Atributos da classe pai acessíveis exclusivamente pelas classes filhas.

### 3. Polimorfismo e Assinaturas Dinâmicas
As rotas de autenticação lidam com requisições globais. Quando o Login ocorre no sistema, tanto a instância de `Paciente` quanto a instância de `Medico` acionam o mesmo método raiz (`getDashboardRoute()`). O motor de herança invoca de forma inteligente o retorno correto (Polimórfico) correspondente ao objeto criado dinamicamente, enviando a URL estática `dashboard-medico.html` ou `dashboard-paciente.html`.

## 📚 Code Docs & JSDocs
Mantendo o padrão adotado na engenharia de software profissional, todos os Controllers, Models, Classes e as chamadas JavaScript de interface da pasta `public/` estão cobertas pela documentação padronizada do **JSDoc/TSDoc**. Em vez de comentários lixos, preservamos apenas documentação explícita de **Regras de Negócio** para fácil compreensão dos domínios do problema.
