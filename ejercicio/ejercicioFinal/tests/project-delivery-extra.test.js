import request from 'supertest';
import { createClient, createProject, getApp, registerAndPrepareUser } from './helpers.js';

describe('project and delivery note extra flow', () => {
  it('updates, archives and restores project', async () => {
    const app = await getApp();
    const { token } = await registerAndPrepareUser();
    const client = await createClient(token);
    const project = await createProject(token, client._id);

    const updated = await request(app)
      .put(`/api/project/${project._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Proyecto Actualizado', active: false })
      .expect(200);

    expect(updated.body.project.active).toBe(false);

    await request(app)
      .delete(`/api/project/${project._id}?soft=true`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const archived = await request(app)
      .get('/api/project/archived')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(archived.body.projects).toHaveLength(1);

    await request(app)
      .patch(`/api/project/${project._id}/restore`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });

  it('creates material delivery note and deletes it when unsigned', async () => {
    const app = await getApp();
    const { token } = await registerAndPrepareUser();
    const client = await createClient(token);
    const project = await createProject(token, client._id);

    const created = await request(app)
      .post('/api/deliverynote')
      .set('Authorization', `Bearer ${token}`)
      .send({
        project: project._id,
        format: 'material',
        description: 'Entrega de material',
        workDate: '2026-05-01',
        material: 'Cable',
        quantity: 12,
        unit: 'm'
      })
      .expect(201);

    const detail = await request(app)
      .get(`/api/deliverynote/${created.body.deliveryNote._id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(detail.body.deliveryNote.format).toBe('material');

    await request(app)
      .delete(`/api/deliverynote/${created.body.deliveryNote._id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);
  });
});
