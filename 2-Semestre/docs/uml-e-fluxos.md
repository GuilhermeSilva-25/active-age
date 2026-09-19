# 📊 Diagramas UML e Fluxos (Eng. de Software II)

Os diagramas abaixo servem para validar a integração entre Back-End, Front-End e Banco de Dados e compõem o Projeto Interdisciplinar.

## 1. Diagrama de Classes (Lógica Orientada a Objetos)
Estrutura refletindo a implementação do TypeScript (MVC / Entidades).

```mermaid
classDiagram
    class Usuario {
        <<abstract>>
        #int id
        #String nome
        #String email
        #String senha
        +fazerLogin(email, senha) boolean
        +getDashboardRoute()* String
    }

    class Paciente {
        -Date dataNascimento
        +agendarConsulta(medico, dataHora) Agendamento
        +cancelarConsulta(idAgendamento) void
        +getDashboardRoute() String
    }

    class Medico {
        -String crm
        -String especialidade
        +disponibilizarHorario(dataHora) void
        +getDashboardRoute() String
    }

    class Agendamento {
        -int id
        -Date dataHora
        -String status
        +confirmar() void
        +cancelar() void
    }

    Usuario <|-- Paciente : Herança
    Usuario <|-- Medico : Herança
    Paciente "1" --> "*" Agendamento : realiza
    Medico "1" --> "*" Agendamento : atende
```

## 2. Diagrama de Sequência: CRUD de Agendamento
Mapeamento do fluxo onde o Paciente escolhe um médico fake no Front-End e realiza a reserva, terminando na página de vídeo simulada.

```mermaid
sequenceDiagram
    actor P as Paciente
    participant F as View (HTML/JS)
    participant API as AgendamentoController (TS)
    participant DAO as Banco de Dados (MySQL)

    P->>F: Clica em "Agendar" na Dra. Ada Lovelace
    F->>API: POST /api/agendamentos {medicoId, dataHora}
    API->>DAO: INSERT INTO agendamentos...
    Note over DAO: Trigger trg_evitar_choque_horario valida conflito.
    DAO-->>API: Status 200 (Sucesso na Inserção)
    API-->>F: JSON { success: true, idAgendamento: 1 }
    F-->>P: "Agendamento Realizado com Sucesso!"
    P->>F: Clica no botão "Acessar Teleconsulta"
    F-->>P: Redireciona para /sala-video-fake.html
```

