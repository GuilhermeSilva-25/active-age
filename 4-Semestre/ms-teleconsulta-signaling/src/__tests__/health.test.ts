import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../app';

describe('Healthcheck & Endpoints Base — ms-teleconsulta-signaling', () => {
  it('deve responder 200 OK com status UP no endpoint /health', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'UP');
    expect(response.body).toHaveProperty('service', 'ms-teleconsulta-signaling');
    expect(response.body).toHaveProperty('version', '1.0.0');
    expect(response.body).toHaveProperty('uptime');
    expect(typeof response.body.uptime).toBe('number');
    expect(response.body).toHaveProperty('timestamp');
  });

  it('deve responder 200 OK com metadados do servico no endpoint raiz /', async () => {
    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('service', 'ms-teleconsulta-signaling');
    expect(response.body).toHaveProperty('health', '/health');
  });

  it('deve responder 404 em rota inexistente', async () => {
    const response = await request(app).get('/rota-inexistente');

    expect(response.status).toBe(404);
  });
});
