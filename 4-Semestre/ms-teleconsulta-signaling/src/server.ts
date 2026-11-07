import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { app } from './app';
import { registerSignalingHandlers } from './signaling/signalingHandler';

const PORT = process.env.PORT || 3001;
const corsOrigin = process.env.CORS_ORIGIN || '*';

export const httpServer = http.createServer(app);

export const io = new SocketIOServer(httpServer, {
  cors: {
    origin: corsOrigin,
    methods: ['GET', 'POST']
  }
});

// Registra os handlers de sinalização WebRTC e controle de salas
registerSignalingHandlers(io);

if (process.env.NODE_ENV !== 'test') {
  httpServer.listen(PORT, () => {
    console.log(`[ms-teleconsulta-signaling] Servidor ativo e operando na porta ${PORT}`);
    console.log(`[ms-teleconsulta-signaling] Healthcheck disponivel em http://localhost:${PORT}/health`);
  });
}
