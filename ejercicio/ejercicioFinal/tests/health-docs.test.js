import request from 'supertest';
import { getApp } from './helpers.js';

describe('health and docs', () => {
  it('returns health status with database state', async () => {
    const app = await getApp();
    const res = await request(app).get('/health').expect(200);

    expect(res.body.status).toBe('ok');
    expect(res.body.db).toBe('connected');
    expect(res.body.timestamp).toBeDefined();
  });

  it('serves swagger ui', async () => {
    const app = await getApp();
    const res = await request(app).get('/api-docs/').expect(200);
    expect(res.text).toContain('Swagger UI');
  });
});
