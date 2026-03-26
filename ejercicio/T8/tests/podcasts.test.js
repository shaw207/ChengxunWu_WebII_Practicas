import request from 'supertest';
import app from '../src/app.js';

describe('Podcasts Endpoints', () => {
  let token = '';
  let podcastId = '';

  beforeAll(async () => {
    const user = {
      name: 'Podcast Tester',
      email: `podcasts_${Date.now()}@example.com`,
      password: 'TestPassword123'
    };

    const res = await request(app)
      .post('/api/auth/register')
      .send(user);

    token = res.body.token;
  });

  describe('GET /api/podcasts', () => {
    it('deber铆a obtener lista de podcasts', async () => {
      const res = await request(app)
        .get('/api/podcasts')
        .expect(200);

      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('POST /api/podcasts', () => {
    it('deber铆a crear un podcast', async () => {
      const podcast = {
        title: 'Test Podcast',
        duration: 180,
        genres: ['rock']
      };

      const res = await request(app)
        .post('/api/podcasts')
        .set('Authorization', `Bearer ${token}`)
        .send(podcast)
        .expect(201);

      expect(res.body.data.title).toBe(podcast.title);
      podcastId = res.body.data._id;
    });

    it('deber铆a rechazar sin autenticaci贸n', async () => {
      await request(app)
        .post('/api/podcasts')
        .send({ title: 'Sin Auth', duration: 100 })
        .expect(401);
    });
  });

  describe('GET /api/podcasts/:id', () => {
    it('deber铆a obtener un podcast por ID', async () => {
      const res = await request(app)
        .get(`/api/podcasts/${podcastId}`)
        .expect(200);

      expect(res.body.data._id).toBe(podcastId);
    });

    it('deber铆a devolver 404 para ID inexistente', async () => {
      await request(app)
        .get('/api/podcasts/65f8b3a2c9d1e20012345678')
        .expect(404);
    });
  });

  describe('PUT /api/podcasts/:id', () => {
    it('deber铆a actualizar un podcast', async () => {
      const res = await request(app)
        .put(`/api/podcasts/${podcastId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Podcast Actualizado' })
        .expect(200);

      expect(res.body.data.title).toBe('Podcast Actualizado');
    });
  });

  describe('DELETE /api/podcasts/:id', () => {
    it('deber铆a rechazar para rol user (solo admin)', async () => {
      await request(app)
        .delete(`/api/podcasts/${podcastId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    });
  });
});
