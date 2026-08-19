# 🌐 Documentação da API REST (Endpoints)

Lista completa das rotas da API do Active Age. Todas as rotas (exceto as de Autenticação) exigem o envio do token JWT no cabeçalho `Authorization: Bearer <token>`.

## 🔐 Módulo: Autenticação (`/api/auth`)
* `POST /cadastrar`
  * **Payload:** `{ nome, email, senha, tipoUsuario, termos }`
  * **Retorno (201):** `{ mensagem, idUsuario }`
* `POST /login`
  * **Payload:** `{ email, senha }`
  * **Retorno (200):** `{ mensagem, token, usuario: { id, nome, tipoPerfil, statusVerificacao } }`

## 🩺 Módulo: Gestão do Médico (`/api/medico`)
* `PUT /perfil` *(Valida tipoPerfil === 'MEDICO')*
  * **Payload:** `{ crm, biografia, especializacoes }`
  * **Ação:** Salva detalhes e altera status para 'APROVADO'.
* `POST /horarios`
  * **Payload:** `{ dataHoraInicio, dataHoraFim }`
  * **Ação:** Cria slots de horários 'DISPONIVEL'.
* `GET /horarios`
  * **Retorno:** Lista cronológica de horários disponíveis futuros do médico logado.
* `GET /agendamentos`
  * **Retorno:** Lista de consultas 'CONFIRMADO' na agenda do médico.

## 🧑‍⚕️ Módulo: Paciente e Buscas (`/api/paciente` e `/api/medicos`)
* `GET /medicos`
  * **Retorno:** Lista todos os médicos com status 'APROVADO'.
* `GET /medicos/:id`
  * **Retorno:** Detalhes de um médico específico (CRM, Bio, Especializações).
* `GET /medicos/:id/horarios`
  * **Retorno:** Lista de horários 'DISPONIVEL' de um médico específico.
* `GET /paciente/agendamentos` *(Valida tipoPerfil === 'PACIENTE_CUIDADOR')*
  * **Retorno:** Lista de consultas futuras e ativas do paciente logado.

## 📅 Módulo: Agendamento Transacional (`/api/agendamentos`)
* `POST /agendamentos`
  * **Payload:** `{ idHorario }`
  * **Ação:** Valida concorrência via `FOR UPDATE`. Cria a consulta e altera o status do horário para 'AGENDADO'.
* `PUT /agendamentos/:id/cancelar`
  * **Ação:** Pode ser disparada pelo médico ou paciente daquela consulta. Muda status para 'CANCELADO' e devolve o horário para 'DISPONIVEL'.