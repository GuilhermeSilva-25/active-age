# 🗄️ Modelagem Relacional (MySQL)

Para o 2º semestre, a camada de persistência foi modelada no **MySQL** usando Docker para suportar um CRUD complexo de Agendamentos e o sistema de Autenticação/Login, atendendo perfeitamente aos requisitos da ementa de "Banco de Dados - Relacional".

## 📊 Tabelas Principais

### 1. `usuarios`
Tabela base para autenticação centralizada, representando a super-classe da POO.
* `id` (INT, PK, Auto Increment)
* `nome` (VARCHAR)
* `email` (VARCHAR, Unique)
* `senha` (VARCHAR)
* `tipo_usuario` (ENUM: 'PACIENTE', 'MEDICO')

### 2. `medicos` & `pacientes`
Tabelas associativas que representam a herança relacional no MySQL.
* **medicos:** `usuario_id` (FK), `crm` (Unique), `especialidade`
* **pacientes:** `usuario_id` (FK), `data_nascimento`

### 3. `horarios_disponiveis` (A Refatoração de Negócio)
Tabela introduzida para atender a regra de negócio correta de agendamentos de saúde, retirando a obrigatoriedade do Paciente escrever a data da consulta e dando a custódia do tempo de volta ao Profissional Médico.
* `id` (INT, PK, Auto Increment)
* `medico_id` (INT, FK -> medicos.id)
* `data_hora` (DATETIME)
* `status` (ENUM: 'LIVRE', 'OCUPADO')

### 4. `agendamentos`
O "coração" do CRUD transacional. Cruza os interesses de Paciente e Médico conectando-se diretamente ao slot liberado.
* `id` (INT, PK, Auto Increment)
* `paciente_id` (INT, FK -> pacientes.id)
* `medico_id` (INT, FK -> medicos.id)
* `data_hora` (DATETIME)
* `status` (ENUM: 'AGENDADO', 'CANCELADO')

---

## ⚙️ Regras Dinâmicas e Controle Concorrencial

Para evitar o cenário temido de *Double Booking* (onde dois pacientes podem tentar marcar exatamente a mesma hora ao mesmo tempo), o sistema não cruza "String de Datas".
A aplicação Front-End consome a primary key `id` da tabela `horarios_disponiveis`. Assim que ocorre o INSERT na tabela de `agendamentos`, o Backend realiza de imediato um UPDATE na tabela `horarios_disponiveis` passando o slot para "OCUPADO", garantindo que a consistência do banco remova o horário da "vitrine" disponível na API. Caso a consulta seja CANCELADA (PUT request no Backend), o status da tabela de horários faz rollback para "LIVRE", devolvendo-o à listagem do frontend de maneira automática.

## 🌱 Seeding de Dados Automático

A documentação conta com um poderoso script `database/seed.sql` configurado para enconding `utf8mb4`. Ele cuida de povoar o Active Age com lendas da tecnologia (Ada Lovelace como Cardiologista, Linus Torvalds, Alan Turing) e também já popula a tabela `horarios_disponiveis` associada a esses médicos, garantindo que o Professor ou Orientador possa testar o CRUD com listagens completas já em execução.
