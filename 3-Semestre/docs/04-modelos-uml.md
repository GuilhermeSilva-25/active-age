# 📐 Modelos UML e Fluxos do Sistema

Para guiar o desenvolvimento das APIs e das interfaces, a arquitetura do **Active Age** foi modelada utilizando a notação UML (Linguagem de Modelagem Unificada).

## 1. Diagrama de Casos de Uso (Visão Geral)
Mapeamento das interações dos usuários com os módulos do sistema.

```mermaid
flowchart LR
    %% Atores
    P[Paciente / Cuidador]
    M[Médico Geriatra]
    A[Administrador]

    %% Casos de Uso
    subgraph Active Age - Plataforma
        UC1(Cadastrar e Autenticar)
        UC2(Buscar Especialistas)
        UC3(Pagar e Agendar Consulta)
        UC4(Gerenciar Vitrine de Horários)
        UC5(Anexar Exames Prévios)
        UC6(Acessar Teleconsulta)
        UC7(Preencher Prontuário Eletrônico)
        UC8(Emitir Documentos/Receitas)
        UC9(Validar CRM / Moderar Plataforma)
        UC10(Gerenciar Assinatura SaaS)
    end

    %% Relações
    P --> UC1
    M --> UC1
    A --> UC1
    
    P --> UC2
    P --> UC3
    P --> UC5
    P --> UC6
    P --> UC8

    M --> UC4
    M --> UC6
    M --> UC7
    M --> UC8
    M --> UC10

    A --> UC9
```

## 2. Diagrama de Classes (Entidades de Domínio)
O mapeamento das coleções que irão residir no MongoDB. O uso de Herança simplifica o gerenciamento de usuários.

```mermaid
classDiagram
    class Usuario {
        <<abstract>>
        +String id
        +String nome
        +String email
        +String senha
        +Enum tipoUsuario
    }

    class Paciente {
        +Date dataNascimento
        +uploadExame()
        +baixarReceita()
    }

    class Medico {
        +String crm
        +String especialidade
        +Enum statusValidacao
        +disponibilizarHorario()
        +emitirReceita()
    }
    
    class Administrador {
        +validarMedico()
        +suspenderUsuario()
    }

    class HorarioDisponivel {
        +String id
        +String medicoId
        +DateTime dataHora
        +Enum status (LIVRE, OCUPADO)
    }

    class Agendamento {
        +String id
        +String pacienteId
        +String medicoId
        +String horarioId
        +Enum statusPago
        +String linkTeleconsulta
    }

    class ProntuarioEletronico {
        +String id
        +String agendamentoId
        +String queixa
        +String diagnostico
        +String conduta
        +Boolean imutavel
    }

    Usuario <|-- Paciente
    Usuario <|-- Medico
    Usuario <|-- Administrador

    Medico "1" --> "*" HorarioDisponivel : gerencia
    Paciente "1" --> "*" Agendamento : realiza
    HorarioDisponivel "1" -- "1" Agendamento : vinculado
    Agendamento "1" --> "1" ProntuarioEletronico : possui
```

## 3. Diagrama de Sequência: Fluxo de Agendamento Seguro
Fluxo que demonstra a inteligência de negócios ao cruzar a **Vitrine de Horários** com a **Efetivação por Pagamento** para garantir a segurança da reserva.

```mermaid
sequenceDiagram
    actor Paciente
    participant Front as React (SPA)
    participant Back as API Spring Boot
    participant DB as MongoDB Atlas
    participant Gateway as Gateway Pagamento

    Paciente->>Front: Acessa perfil do Médico e escolhe horário
    Front->>Back: GET /api/horarios/{medico_id}?status=LIVRE
    Back->>DB: Busca horários disponíveis
    DB-->>Back: Lista de documentos
    Back-->>Front: Retorna JSON (horario_id, dataHora)
    
    Paciente->>Front: Seleciona "horario_123" e clica em Pagar
    Front->>Gateway: Envia dados do cartão
    Gateway-->>Front: Pagamento Aprovado (Token)
    
    Front->>Back: POST /api/agendamentos {paciente_id, horario_123, token_pagamento}
    Back->>Gateway: Valida a autenticidade do token
    Gateway-->>Back: Token Válido
    
    Note over Back,DB: Transação / Concorrência
    Back->>DB: INSERT Agendamento
    Back->>DB: UPDATE HorarioDisponivel SET status='OCUPADO' WHERE id='horario_123'
    
    DB-->>Back: Confirma transação
    Back-->>Front: Status 201 (Created) + Link da Teleconsulta
    Front-->>Paciente: "Consulta Confirmada com Sucesso!"
```

