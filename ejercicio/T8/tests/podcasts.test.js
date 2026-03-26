import mongoose from 'mongoose';
import request from 'supertest';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET ??= 'supersecretkey_min32chars_requerido';
process.env.JWT_EXPIRES_IN ??= '2h';

const TEST_DB_URI = process.env.MONGODB_TEST_URI;

if (!TEST_DB_URI) {
  throw new Error('MONGODB_TEST_URI is required for podcast tests');
}

const { default: app } = await import('../src/app.js');
const { default: User } = await import('../src/models/user.model.js');
const { default: Podcast } = await import('../src/models/podcast.model.js');

const createUserThroughApi = async ({ role = 'user', suffix = Date.now() } = {}) => {
  const registerRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: `${role}-tester-${suffix}`,
      email: `${role}_${suffix}@example.com`,
      password: 'TestPassword123'
    })
    .expect(201);

  if (role === 'admin') {
    await User.findByIdAndUpdate(registerRes.body.user._id, { role: 'admin' });
  }

  return {
    token: registerRes.body.token,
    userId: registerRes.body.user._id
  };
};

describe('Podcasts Endpoints', () => {
  beforeAll(async () => {
    await mongoose.connect(TEST_DB_URI, {
      serverSelectionTimeoutMS: 20000
    });
  });

  beforeEach(async () => {
    await Podcast.deleteMany({});
    await User.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  describe('GET /api/podcasts', () => {
    it('returns 200 with an array of only published podcasts', async () => {
      const { userId } = await createUserThroughApi({ suffix: `${Date.now()}_public` });

      await Podcast.create([
        {
          title: 'Published podcast',
          description: 'This published podcast should be visible in the public list.',
          author: userId,
          category: 'tech',
          duration: 600,
          episodes: 2,
          published: true
        },
        {
          title: 'Draft podcast',
          description: 'This draft podcast should not be visible in the public list.',
          author: userId,
          category: 'science',
          duration: 900,
          episodes: 4,
          published: false
        }
      ]);

      const res = await request(app)
        .get('/api/podcasts')
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].published).toBe(true);
    });
  });

  describe('POST /api/podcasts', () => {
    it('returns 201 with created podcast when token is present', async () => {
      const { token } = await createUserThroughApi({ suffix: `${Date.now()}_create` });

      const res = await request(app)
        .post('/api/podcasts')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'API test podcast',
          description: 'This description is long enough to satisfy the validator.',
          category: 'history',
          duration: 1200,
          episodes: 6
        })
        .expect(201);

      expect(res.body.data.title).toBe('API test podcast');
      expect(res.body.data.published).toBe(false);
    });

    it('returns 401 without token', async () => {
      await request(app)
        .post('/api/podcasts')
        .send({
          title: 'No auth',
          description: 'This request should fail because it has no auth token.',
          category: 'news',
          duration: 600
        })
        .expect(401);
    });
  });

  describe('DELETE /api/podcasts/:id', () => {
    it('returns 403 for a normal user', async () => {
      const { token, userId } = await createUserThroughApi({ suffix: `${Date.now()}_user_delete` });

      const podcast = await Podcast.create({
        title: 'Delete denied',
        description: 'Only an admin should be able to delete this podcast entry.',
        author: userId,
        category: 'comedy',
        duration: 700,
        episodes: 1,
        published: false
      });

      await request(app)
        .delete(`/api/podcasts/${podcast._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    });

    it('returns 200 for an admin', async () => {
      const author = await createUserThroughApi({ suffix: `${Date.now()}_author_delete` });
      const admin = await createUserThroughApi({ role: 'admin', suffix: `${Date.now()}_admin_delete` });

      const podcast = await Podcast.create({
        title: 'Delete allowed',
        description: 'An admin should be allowed to delete this podcast entry.',
        author: author.userId,
        category: 'tech',
        duration: 840,
        episodes: 3,
        published: false
      });

      await request(app)
        .delete(`/api/podcasts/${podcast._id}`)
        .set('Authorization', `Bearer ${admin.token}`)
        .expect(200);
    });
  });

  describe('GET /api/podcasts/admin/all', () => {
    it('returns 200 only for admin users', async () => {
      const author = await createUserThroughApi({ suffix: `${Date.now()}_author_admin_all` });
      const admin = await createUserThroughApi({ role: 'admin', suffix: `${Date.now()}_admin_admin_all` });

      await Podcast.create([
        {
          title: 'Admin visible published',
          description: 'Published podcast included in the admin listing.',
          author: author.userId,
          category: 'tech',
          duration: 900,
          episodes: 5,
          published: true
        },
        {
          title: 'Admin visible draft',
          description: 'Draft podcast included in the admin listing for admins only.',
          author: author.userId,
          category: 'news',
          duration: 650,
          episodes: 2,
          published: false
        }
      ]);

      const res = await request(app)
        .get('/api/podcasts/admin/all')
        .set('Authorization', `Bearer ${admin.token}`)
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data).toHaveLength(2);
    });
  });
});
