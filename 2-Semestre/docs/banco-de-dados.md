# 🗄️ Modelagem Relacional (MySQL)

Para o 2º semestre, a camada de persistência foi modelada no **MySQL** para suportar o CRUD de Agendamentos e o sistema de Autenticação/Login, atendendo perfeitamente aos requisitos da ementa de "Banco de Dados - Relacional".

## 🧩 Tabelas Principais

### 1. `usuarios`
Tabela base para autenticação centralizada.
* `id` (INT, PK, Auto Increment)
* `nome` (VARCHAR)
* `email` (VARCHAR, Unique)
* `senha` (VARCHAR) - Armazenada em Hash para segurança.
* `tipo_usuario` (ENUM: 'PACIENTE', 'MEDICO')

### 2. `medicos`
Tabela associativa para a especialização do usuário Médico.
* `id` (INT, PK, Auto Increment)
* `usuario_id` (INT, FK -> usuarios.id)
* `crm` (VARCHAR, Unique)
* `especialidade` (VARCHAR)
* `valor_consulta` (DECIMAL)

### 3. `pacientes`
Tabela associativa para a especialização do usuário Paciente.
* `id` (INT, PK, Auto Increment)
* `usuario_id` (INT, FK -> usuarios.id)
* `data_nascimento` (DATE)

### 4. `agendamentos`
O "coração" do CRUD. Registra as consultas relacionando Paciente e Médico.
* `id` (INT, PK, Auto Increment)
* `paciente_id` (INT, FK -> pacientes.id)
* `medico_id` (INT, FK -> medicos.id)
* `data_hora` (DATETIME)
* `status` (ENUM: 'AGENDADO', 'CANCELADO', 'CONCLUIDO')

---

## ⚙️ Stored Procedures e Triggers

Para atender ao escopo avançado de Banco de Dados exigido na grade curricular, transferimos partes da lógica de negócio para o motor do MySQL.

### Trigger: `trg_evitar_choque_horario`
Gatilho executado na ação `BEFORE INSERT` na tabela `agendamentos`. 
* **Função:** Valida se o `medico_id` já possui uma consulta com status 'AGENDADO' na exata `data_hora` requerida.
* **Ação:** Caso detecte conflito, o Trigger lança um sinal SQL (`SIGNAL SQLSTATE '45000'`) abortando a inserção e garantindo a integridade concorrencial da agenda, aliviando o Back-End em TypeScript desse papel.

### Stored Procedure: `sp_seed_medicos_tech`
Procedimento armazenado responsável por inserir rapidamente os dados falsos.
* **Função:** Popula automaticamente a tabela `usuarios` e `medicos` com grandes nomes da tecnologia (Ex: Dra. Ada Lovelace - Cardiologista, Dr. Alan Turing - Neurologista, Dr. Linus Torvalds - Clínico Geral). Cria também "slots" de horários de teste na agenda para facilitar a validação do CRUD pelo professor.

