import express, { Request, Response } from 'express';
import cors from 'cors';

export const app = express();

const corsOrigin = process.env.CORS_ORIGIN || '*';

app.use(cors({
  origin: corsOrigin,
  credentials: true
}));

app.use(express.json());

// Endpoint raiz informativo
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    service: 'ms-teleconsulta-signaling',
    description: 'Active Age — WebRTC Signaling Server (Teleconsulta Geriátrica)',
    version: '1.0.0',
    health: '/health'
  });
});

// Endpoint de Healthcheck (Kubernetes / Render / Docker)
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'UP',
    service: 'ms-teleconsulta-signaling',
    version: '1.0.0',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});
