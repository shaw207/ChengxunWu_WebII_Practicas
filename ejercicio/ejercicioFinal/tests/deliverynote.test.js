import request from 'supertest';
import { createClient, createProject, getApp, registerAndPrepareUser } from './helpers.js';

describe('delivery notes', () => {
  it('creates hours delivery note, lists with filters and downloads pdf', async () => {
    const app = await getApp();
    const { token } = await registerAndPrepareUser();
    const client = await createClient(token);
    const project = await createProject(token, client._id);

    const created = await request(app)
      .post('/api/deliverynote')
      .set('Authorization', `Bearer ${token}`)
      .send({
        project: project._id,
        format: 'hours',
        description: 'Trabajo realizado',
        workDate: '2026-05-01',
        hours: 4
      })
      .expect(201);

    expect(created.body.deliveryNote.client).toBe(client._id);

    const list = await request(app)
      .get(`/api/deliverynote?project=${project._id}&format=hours&signed=false`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(list.body.deliveryNotes).toHaveLength(1);

    const pdf = await request(app)
      .get(`/api/deliverynote/pdf/${created.body.deliveryNote._id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(pdf.headers['content-type']).toMatch(/application\/pdf/);
  });

  it('validates material delivery note required fields', async () => {
    const app = await getApp();
    const { token } = await registerAndPrepareUser();

    const invalid = await request(app)
      .post('/api/deliverynote')
      .set('Authorization', `Bearer ${token}`)
      .send({
        project: '507f1f77bcf86cd799439011',
        format: 'material',
        description: 'Material'
      })
      .expect(400);

    expect(invalid.body.code).toBe('VALIDATION_ERROR');
  });
});
