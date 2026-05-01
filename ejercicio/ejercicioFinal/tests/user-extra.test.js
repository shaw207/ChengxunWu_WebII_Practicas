import request from 'supertest';
import { getApp, registerAndPrepareUser } from './helpers.js';

describe('user management extra flow', () => {
  it('refreshes token, changes password, invites guest and soft deletes user', async () => {
    const app = await getApp();
    const { token, password } = await registerAndPrepareUser();

    const login = await request(app)
      .post('/api/user/login')
      .send({ email: 'not-an-email', password })
      .expect(400);

    expect(login.body.code).toBe('VALIDATION_ERROR');

    const profile = await request(app)
      .get('/api/user')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const userEmail = profile.body.user.email;

    const realLogin = await request(app)
      .post('/api/user/login')
      .send({ email: userEmail, password })
      .expect(200);

    const refreshed = await request(app)
      .post('/api/user/refresh')
      .send({ refreshToken: realLogin.body.refreshToken })
      .expect(200);

    expect(refreshed.body.accessToken).toBeDefined();

    await request(app)
      .put('/api/user/password')
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: password, newPassword: 'newpassword123' })
      .expect(200);

    await request(app)
      .post('/api/user/invite')
      .set('Authorization', `Bearer ${token}`)
      .send({
        email: `guest-${Date.now()}@test.com`,
        password: 'password123',
        name: 'Guest'
      })
      .expect(201);

    await request(app)
      .delete('/api/user?soft=true')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });
});
