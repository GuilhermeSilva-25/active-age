# 🏛️ Documento de Arquitetura de Software (Back-End)

Este documento detalha as decisões arquiteturais do back-end do Active Age para o 2º semestre, focando no gerenciamento de identidade, segurança e transações relacionais.

## 1. Padrão Arquitetural
A aplicação foi desenvolvida seguindo o padrão **API RESTful** utilizando **Node.js** com o framework **Express**. A escolha desse modelo permite uma clara separação de responsabilidades (Separation of Concerns) e facilita o consumo por múltiplos clientes (Web e Mobile no futuro).

A arquitetura interna segue uma adaptação do padrão MVC focada em serviços:
* **`/routes` (Controladores):** Mapeiam os endpoints HTTP, recebem as requisições (Requests) e retornam as respostas (Responses) em formato JSON.
* **`/middleware` (Interceptadores):** Camada de segurança intermediária. Intercepta requisições para validar a autenticidade antes de permitir o acesso às rotas protegidas.
* **`/config` (Infraestrutura):** Centraliza as conexões com serviços externos, como o pool de conexões do banco de dados.

## 2. Estratégia de Segurança (LGPD e Conformidade)
Dado o tráfego de informações sensíveis e a conformidade com a LGPD, a arquitetura implementa o conceito de *Security by Design*:
* **Criptografia de Senhas:** Nenhuma senha é armazenada em texto plano. O sistema utiliza a biblioteca `bcrypt` com "Salt" dinâmico para gerar hashes irreversíveis no momento do cadastro.
* **Autenticação Stateless (JWT):** A API não guarda sessão em memória. O controle de acesso é feito via JSON Web Token (`jsonwebtoken`). O token possui tempo de expiração (`8h`) e encapsula a autorização (Role-Based Access Control - RBAC), garantindo que Pacientes não acessem rotas exclusivas de Médicos e vice-versa.

## 3. Gestão de Concorrência (ACID)
Para o agendamento de consultas, a API utiliza **Transações de Banco de Dados** (`beginTransaction`, `COMMIT`, `ROLLBACK`) em conjunto com bloqueios de linha (`FOR UPDATE`). Isso garante a integridade referencial e impede falhas de concorrência (ex: dois pacientes agendando o mesmo horário simultaneamente).