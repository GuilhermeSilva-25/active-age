# 📡 Microsserviço de Sinalização WebRTC (`ms-teleconsulta-signaling`)
## Plataforma Active Age — Telessaúde Geriátrica Integral
### Faculdade de Tecnologia de Diadema (Fatec Luigi Papaiz) — DSM 4º Semestre

Microsserviço de baixa latência e alta concorrência construído em **Node.js LTS + TypeScript + Socket.io + Express** para orquestrar a sinalização WebRTC (troca de SDP Offers/Answers e ICE Candidates) entre médicos e pacientes/cuidadores na teleconsulta geriátrica.

---

### 1. Responsabilidades

- **Isolamento de Canais:** Salas efêmeras segregadas pelo `appointmentId`;
- **Troca de Mensagens SDP:** Encaminhamento de ofertas e respostas de mídia entre pares;
- **Descoberta de Rota ICE:** Sinalização de candidatos STUN/TURN;
- **Controle de Mídia:** Notificação de mute de áudio e pausa de vídeo;
- **Desacoplamento do Core:** Desonera o backend Spring Boot de conexões de longa duração WebSockets.

---

### 2. Endpoints HTTP

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/` | Informações do microsserviço |
| `GET` | `/health` | Healthcheck para Kubernetes, Docker e monitoramento de uptime |

---

### 3. Como Executar Localmente

```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento (com hot-reload)
npm run dev

# Executar suíte de testes automatizados
npm run test

# Compilar para produção (TypeScript -> JavaScript)
npm run build

# Executar build compilado
npm start
```

---

### 4. Execução em Container Docker

```bash
# Build da imagem Docker multi-stage
docker build -t activeage-signaling:latest .

# Execução na porta 3001
docker run -p 3001:3001 activeage-signaling:latest
```
