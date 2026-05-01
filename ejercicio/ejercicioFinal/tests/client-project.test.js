import request from 'supertest';
import { createClient, createProject, getApp, registerAndPrepareUser } from './helpers.js';

describe('clients and projects', () => {
  it('creates, lists, archives and restores a client', async () => {
    const app = await getApp();
    const { token } = await registerAndPrepareUser();
    const client = await createClient(token);

    const list = await request(app)
      .get('/api/client?name=Cliente&sortBy=name&order=asc')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(list.body.clients).toHaveLength(1);
    expect(list.body.pagination.totalItems).toBe(1);

    await request(app)
      .delete(`/api/client/${client._id}?soft=true`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const archived = await request(app)
      .get('/api/client/archived')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(archived.body.clients).toHaveLength(1);

    await request(app)
      .patch(`/api/client/${client._id}/restore`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });

  it('creates and filters projects by client and active status', async () => {
    const app = await getApp();
    const { token } = await registerAndPrepareUser();
    const client = await createClient(token);
    const project = await createProject(token, client._id);

    const list = await request(app)
      .get(`/api/project?client=${client._id}&active=true&sort=-createdAt`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(list.body.projects).toHaveLength(1);
    expect(list.body.projects[0]._id).toBe(project._id);
  });
});
