import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { app } from './app';

const PORT = process.env.PORT || 3001;
const corsOrigin = process.env.CORS_ORIGIN || '*';

export const httpServer = http.createServer(app);

export const io = new SocketIOServer(httpServer, {
  cors: {
    origin: corsOrigin,
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  // Conexão inicial estabelecida - detalhamento das salas na Micro Tarefa 16.2
  socket.on('disconnect', () => {
    // Desconexão
  });
});

if (process.env.NODE_ENV !== 'test') {
  httpServer.listen(PORT, () => {
    console.log(`[ms-teleconsulta-signaling] Servidor ativo e operando na porta ${PORT}`);
    console.log(`[ms-teleconsulta-signaling] Healthcheck disponivel em http://localhost:${PORT}/health`);
  });
}
