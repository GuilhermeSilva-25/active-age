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
    participant API as Backend (Node/TS)
    participant DAO as Banco de Dados (MySQL)

    Note over P,DAO: Fase 1: Carregamento da Vitrine
    P->>F: Acessa o Dashboard do Paciente
    F->>API: GET /api/horarios/livres
    API->>DAO: SELECT * FROM horarios_disponiveis WHERE status = 'LIVRE'
    DAO-->>API: Retorna os slots e dados dos médicos
    API-->>F: JSON [ { horario_id, data_hora, medico_nome... } ]
    F-->>P: Renderiza os dropdowns dinâmicos

    Note over P,DAO: Fase 2: Reserva do Horário
    P->>F: Seleciona Dra. Ada Lovelace, escolhe a data e clica "Agendar"
    F->>API: POST /api/agendamentos { usuario_id, medico_id, horario_id }
    
    API->>DAO: SELECT data_hora FROM horarios_disponiveis WHERE id = horario_id
    DAO-->>API: Retorna a data correspondente
    
    API->>DAO: INSERT INTO agendamentos (paciente_id, medico_id, data_hora)
    API->>DAO: UPDATE horarios_disponiveis SET status = 'OCUPADO' WHERE id = horario_id
    
    DAO-->>API: Status 201 (Created)
    API-->>F: JSON { mensagem: "Sucesso", idAgendamento: X }
    F-->>P: "Consulta agendada!" (SweetAlert)
    
    Note over P,F: Fase 3: Telemedicina
    P->>F: Clica no botão "Acessar Sala" na tabela
    F-->>P: Redireciona para /sala-video-fake.html
```
