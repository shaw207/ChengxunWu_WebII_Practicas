import request from 'supertest';

export const getApp = async () => {
  const { default: app } = await import('../src/app.js');
  return app;
};

export const registerAndPrepareUser = async () => {
  const app = await getApp();
  const email = `user-${Date.now()}-${Math.random().toString(16).slice(2)}@test.com`;
  const password = 'password123';

  const register = await request(app).post('/api/user/register').send({ email, password }).expect(201);
  const token = register.body.accessToken;

  await request(app)
    .put('/api/user/register')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: 'Ana',
      lastName: 'Garcia',
      nif: '12345678Z',
      address: {
        street: 'Mayor',
        number: '1',
        postal: '28001',
        city: 'Madrid',
        province: 'Madrid'
      }
    })
    .expect(200);

  await request(app)
    .patch('/api/user/company')
    .set('Authorization', `Bearer ${token}`)
    .send({
      isFreelance: false,
      name: 'Bildy Test',
      cif: `B${Date.now().toString().slice(-8)}`,
      address: {
        street: 'Empresa',
        number: '2',
        postal: '28002',
        city: 'Madrid',
        province: 'Madrid'
      }
    })
    .expect(200);

  return { token, email, password };
};

export const createClient = async (token, overrides = {}) => {
  const app = await getApp();
  const response = await request(app)
    .post('/api/client')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: 'Cliente Test',
      cif: `C${Date.now().toString().slice(-8)}`,
      email: 'cliente@test.com',
      phone: '+34910000000',
      address: {
        street: 'Cliente',
        number: '3',
        postal: '28003',
        city: 'Madrid',
        province: 'Madrid'
      },
      ...overrides
    })
    .expect(201);

  return response.body.client;
};

export const createProject = async (token, clientId, overrides = {}) => {
  const app = await getApp();
  const response = await request(app)
    .post('/api/project')
    .set('Authorization', `Bearer ${token}`)
    .send({
      client: clientId,
      name: 'Proyecto Test',
      projectCode: `PR-${Date.now().toString().slice(-6)}`,
      address: {
        street: 'Obra',
        number: '4',
        postal: '28004',
        city: 'Madrid',
        province: 'Madrid'
      },
      email: 'obra@test.com',
      notes: 'Notas',
      active: true,
      ...overrides
    })
    .expect(201);

  return response.body.project;
};
