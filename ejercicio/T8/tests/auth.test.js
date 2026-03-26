import mongoose from 'mongoose';
import request from 'supertest';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET ??= 'supersecretkey_min32chars_requerido';
process.env.JWT_EXPIRES_IN ??= '2h';

const TEST_DB_URI = process.env.MONGODB_TEST_URI;

if (!TEST_DB_URI) {
  throw new Error('MONGODB_TEST_URI is required for auth tests');
}

const { default: app } = await import('../src/app.js');
const { default: User } = await import('../src/models/user.model.js');

describe('Auth Endpoints', () => {
  const testUser = {
    name: 'Test User',
    email: `test_${Date.now()}@example.com`,
    password: 'TestPassword123'
  };

  beforeAll(async () => {
    await mongoose.connect(TEST_DB_URI, {
      serverSelectionTimeoutMS: 20000
    });
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  describe('POST /api/auth/register', () => {
    it('returns 201 with created user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe(testUser.email);
      expect(res.body.user.role).toBe('user');
      expect(res.body.user).not.toHaveProperty('password');
    });

    it('returns 400 for duplicate email', async () => {
      await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(400);

      expect(res.body.error).toBe(true);
    });

    it('returns 400 when fields are missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'invalid@example.com' })
        .expect(400);

      expect(res.body.error).toBe(true);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);
    });

    it('returns 201 with token for valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(201);

      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toBe(testUser.email);
    });

    it('returns 401 for wrong password', async () => {
      await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123'
        })
        .expect(401);
    });
  });

  describe('GET /api/auth/me', () => {
    let token = '';

    beforeEach(async () => {
      const registerRes = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      token = registerRes.body.token;
    });

    it('returns 200 with current user data', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.email).toBe(testUser.email);
    });

    it('returns 401 without token', async () => {
      await request(app)
        .get('/api/auth/me')
        .expect(401);
    });
  });
});
