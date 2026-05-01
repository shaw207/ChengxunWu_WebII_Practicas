import request from 'supertest';
import { getApp } from './helpers.js';

describe('user auth flow', () => {
  it('registers, logs in and protects authenticated profile', async () => {
    const app = await getApp();
    const email = `auth-${Date.now()}@test.com`;
    const password = 'password123';

    const register = await request(app)
      .post('/api/user/register')
      .send({ email, password })
      .expect(201);

    expect(register.body.accessToken).toBeDefined();
    expect(register.body.refreshToken).toBeDefined();
    expect(register.body.user.email).toBe(email);

    const login = await request(app)
      .post('/api/user/login')
      .send({ email, password })
      .expect(200);

    expect(login.body.accessToken).toBeDefined();

    const profile = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${login.body.accessToken}`)
      .expect(200);

    expect(profile.body.user.email).toBe(email);
  });

  it('rejects invalid register data and missing token', async () => {
    const app = await getApp();
    const invalid = await request(app)
      .post('/api/user/register')
      .send({ email: 'bad', password: 'short' })
      .expect(400);

    expect(invalid.body.code).toBe('VALIDATION_ERROR');

    const protectedRoute = await request(app).get('/api/user').expect(401);
    expect(protectedRoute.body.code).toBe('TOKEN_REQUIRED');
  });
});
