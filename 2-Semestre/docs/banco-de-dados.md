# 🗄️ Dicionário de Dados Relacional (SQL)

Abaixo está o mapeamento lógico e físico das tabelas que compõem o banco de dados relacional (MySQL/PostgreSQL) do Active Age para gestão de usuários e agendamentos.

## 1. Tabela: `usuarios`
Centraliza a identidade e autenticação de todos os perfis da plataforma.
* `idUsuario` (INT, PK, Auto Increment)
* `nome` (VARCHAR, Not Null)
* `email` (VARCHAR, Unique, Not Null)
* `senha` (VARCHAR, Not Null) - *Armazena o hash bcrypt.*
* `tipoPerfil` (ENUM) - *'PACIENTE_CUIDADOR', 'MEDICO', 'ADMINISTRADOR'*
* `statusVerificacao` (ENUM) - *'PENDENTE', 'APROVADO', 'SUSPENSO'*

## 2. Tabela: `medico_detalhes`
Armazena os dados complementares profissionais. Relaciona-se 1:1 com `usuarios`.
* `idUsuario` (INT, PK, FK -> usuarios.idUsuario)
* `crm` (VARCHAR, Unique, Not Null)
* `biografia` (TEXT)
* `especializacoes` (VARCHAR)

## 3. Tabela: `horarios_disponiveis`
Gerenciada pelo médico para definir sua grade de atendimento.
* `idHorario` (INT, PK, Auto Increment)
* `idMedico` (INT, FK -> usuarios.idUsuario)
* `dataHoraInicio` (DATETIME, Not Null)
* `dataHoraFim` (DATETIME, Not Null)
* `status` (ENUM) - *'DISPONIVEL', 'AGENDADO'*

## 4. Tabela: `agendamentos`
Registra a transação final da consulta.
* `idAgendamento` (INT, PK, Auto Increment)
* `idPaciente` (INT, FK -> usuarios.idUsuario)
* `idMedico` (INT, FK -> usuarios.idUsuario)
* `idHorario` (INT, FK -> horarios_disponiveis.idHorario)
* `dataHoraInicio` (DATETIME, Not Null)
* `dataHoraFim` (DATETIME, Not Null)
* `statusAgendamento` (ENUM) - *'CONFIRMADO', 'CANCELADO', 'CONCLUIDO'*