# 💳 Microsserviço de Pagamento & Faturamento SaaS (`ms-pagamento-faturamento`)
## Active Age — Plataforma Integral de Telessaúde Geriátrica
### Faculdade de Tecnologia de Diadema (Fatec Luigi Papaiz) — DSM 4º Semestre

Microsserviço corporativo de alta disponibilidade construído em **Java 21 LTS + Spring Boot 3 + Spring Data JPA / H2** para gestão financeira, liquidação instantânea com **Split Direto BACEN** (sem dicotomia médica conforme Resolução CFM nº 2.314/2022) e faturamento de assinaturas SaaS de consultório virtual para médicos geriatras.

---

### 1. Responsabilidades Principais

1. **Split Direto de Pagamentos (Consultas Telemédicas):**
   - 100% dos honorários da consulta são liquidados diretamente para a conta do médico credenciado perante o BACEN;
   - A plataforma Active Age **não retém comissões nem custodia valores de consultas**, cumprindo a vedação ética à dicotomia médica (Resoluções CFM nº 2.314/2022 e 2.336/2023).
2. **Faturamento & Licenciamento SaaS:**
   - Cobrança de taxa mensal fixa de consultório virtual (R$ 149,90/mês) pelo uso da tecnologia (prontuário com hash SHA-256, teleconsulta P2P WebRTC e cofre de exames);
   - Suporte a múltiplos métodos de liquidação: Pix Instantâneo, Cartão de Crédito Transparente e Mercado Pago Checkout Pro;
   - Emissão de extrato financeiro em Preto e Branco puro (P&B) timbrado com autenticação `AA-SAAS-2026-XXXXXX`.
3. **Resiliência e Tolerância a Falhas:**
   - **Circuit Breaker** com **Resilience4j** contra instabilidades do gateway externo;
   - Cache em memória com **Caffeine** para evitar chamadas redundantes e respeitar limites de taxa;
   - Webhooks com chave de idempotência para processamento atômico de notificações de pagamento.

---

### 2. Endpoints da API RESTful

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/pagamentos/processar` | Processa pagamento de consulta ou plano SaaS (Pix, Cartão ou Checkout Pro) |
| `GET` | `/api/pagamentos/{id}` | Consulta status de transação financeira por ID |
| `GET` | `/api/pagamentos/consulta/{appointmentId}` | Recupera comprovante de pagamento vinculado à consulta |
| `GET` | `/api/pagamentos/extrato/medico/{medicoId}` | Retorna extrato de faturas SaaS do médico |
| `POST` | `/api/assinaturas/ativar` | Ativação atômica de plano mensal de consultório virtual do médico |
| `POST` | `/api/webhook/mercadopago` | Receptor de webhooks assíncronos do Mercado Pago com validação de assinatura |
| `GET` | `/api/health` | Healthcheck para Kubernetes, Docker e observabilidade |

---

### 3. Suíte de Testes Automatizados (39 Testes JUnit 5 / MockMvc)

O microsserviço conta com **39 testes automatizados** (0 falhas) cobrindo:
* Fluxos felizes de checkout Pix com QR Code Base64;
* Simulação de cartão de crédito e geração de link seguro Checkout Pro;
* Acionamento e fallback do Circuit Breaker sob timeout simulado;
* Tratamento de exceções e payloads inválidos via MockMvc;
* Idempotência de webhooks para pagamentos duplicados.

---

### 4. Como Executar Localmente

```bash
# 1. Entrar na pasta do microsserviço
cd 4-Semestre/ms-pagamento-faturamento

# 2. Executar os 39 testes automatizados com Surefire e JaCoCo
./mvnw test

# 3. Iniciar a aplicação localmente (Porta 8082)
./mvnw spring-boot:run
```

O console do banco em memória H2 fica acessível em:
`http://localhost:8082/h2-console` (JDBC URL: `jdbc:h2:mem:pagamentodb`)

---

### 5. Execução em Container Docker

```bash
# Construir imagem multi-stage
docker build -t active-age-payment:local .

# Executar container
docker run -p 8082:8082 active-age-payment:local
```

---
*Microsserviço homologado no 4º Semestre (Sistemas Distribuídos & DevOps).*  
*Projeto Integrador Active Age — Fatec Diadema DSM 2026.*
