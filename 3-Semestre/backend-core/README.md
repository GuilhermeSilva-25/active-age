# ☕ Backend Core API (`backend-core`)
## Active Age — Plataforma Integral de Telessaúde Geriátrica
### Faculdade de Tecnologia de Diadema (Fatec Luigi Papaiz) — DSM 3º e 4º Semestres

API RESTful corporativa de alta confiabilidade construída em **Java 21 LTS + Spring Boot 3.4.x + Spring Data MongoDB**, centralizando as regras clínicas, prontuários geriátricos imutáveis, autenticação perimetral RBAC, agendamento atômico e conformidade ética rigorosa com o **Conselho Federal de Medicina (CFM)** e a **LGPD**.

---

### 1. Pilares Arquiteturais & Segurança

* **Segurança e Criptografia:** Senhas criptografadas com **BCrypt**, tokens JWT assinados armazenados em cookies seguros `HttpOnly; Secure; SameSite=Strict`, e proteção perimetral contra força bruta via **Bucket4j Rate Limiting**;
* **Prontuário Imutável (RN003):** Registro de consultas com hash criptográfico SHA-256 inviolável, rastreabilidade de autor e trava contra edições retroativas;
* **Cofre Digital de Exames (GridFS):** Armazenamento de laudos, exames laboratoriais e fotos de documentos diretamente no MongoDB GridFS;
* **Trilha de Auditoria Imutável (`audit_logs`):** Log estruturado append-only registrando todas as ações críticas (bloqueios, aprovação de credenciamento, agendamentos e cancelamentos);
* **Conformidade Regulatória:** Resoluções CFM nº 2.314/2022 (telemedicina), nº 2.336/2023 (vitrine neutra sem autopromoção) e SBIS (NGS1/NGS2).

---

### 2. Suíte de Testes Automatizados & Cobertura JaCoCo

O Backend Core é blindado por **184 testes automatizados** com 100% de aprovação e **0 falhas**:
* **14 Controladores REST 100% Blindados com MockMvc** (96% de instruções cobertas);
* **Camada de Serviços (Services):** 80%+ de cobertura testando caminhos felizes e de exceção (*sad paths*);
* **Cobertura Global no JaCoCo:** **84% de instruções** e **56% de branches** auditadas em 45/45 classes;
* Relatórios gerados em `target/surefire-reports/` e `target/site/jacoco/index.html`.

---

### 3. Principais Módulos de API RESTful

| Módulo | Prefixo de Rota | Responsabilidade |
|---|---|---|
| **Autenticação** | `/api/auth` | Login, registro de médico/paciente, verificação de e-mail e logout seguro |
| **Perfil** | `/api/users/profile` | Gestão de foto, biografia, telefone e dados de cuidador familiar |
| **Credenciamento** | `/api/doctor/credentialing` | Dossiê ético em 4 pilares (diploma, CRM, certidão de regularidade) |
| **Agenda Médica** | `/api/doctor/schedule` | Criação de turnos, geração em lote de slots e controle de disponibilidade |
| **Agendamento** | `/api/appointments` | Reserva atômica anti-double booking e cancelamento ético |
| **Teleconsulta** | `/api/teleconsulta` | Sala virtual, ata clínica e baixa de atendimento |
| **Prontuário** | `/api/medical-records` | Prontuário eletrônico geriátrico com AGA, CID-11 e hash SHA-256 |
| **Documentos** | `/api/medical-documents` | Emissão de receitas digitais com código ICP-Brasil `AA-2026-XXXXXX` |
| **Cofre de Exames** | `/api/patient/exams` | Upload e download de arquivos médicos no GridFS |
| **Auditoria Admin** | `/api/admin` | Fila de credenciamento, moderação de usuários e métricas operacionais |

---

### 4. Como Executar Localmente

```bash
# 1. Entrar na pasta do backend core
cd 3-Semestre/backend-core

# 2. Executar os 184 testes automatizados com JaCoCo
./mvnw test

# 3. Iniciar a API em modo de desenvolvimento (Porta 8080)
./mvnw spring-boot:run
```

A documentação interativa Swagger/OpenAPI fica acessível em:  
`http://localhost:8080/swagger-ui/index.html`

---

### 5. Execução em Container Docker Multi-Stage

```bash
# Construir a imagem Docker de produção
docker build -t active-age-backend-core:local .

# Executar o container
docker run -p 8080:8080 -e SPRING_DATA_MONGODB_URI="mongodb://host.docker.internal:27017/active_age" active-age-backend-core:local
```

---
*Backend Core homologado para o 3º e 4º Semestres.*  
*Projeto Integrador Active Age — Fatec Diadema DSM 2026.*
