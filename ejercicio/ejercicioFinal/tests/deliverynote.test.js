import request from 'supertest';
import DeliveryNote from '../src/models/DeliveryNote.js';
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

  it('creates material delivery note with multiple workers in payload and documents they are ignored by the material contract', async () => {
    const app = await getApp();
    const { token } = await registerAndPrepareUser();
    const user = await request(app).get('/api/user').set('Authorization', `Bearer ${token}`).expect(200);
    const client = await createClient(token);
    const project = await createProject(token, client._id);

    const created = await request(app)
      .post('/api/deliverynote')
      .set('Authorization', `Bearer ${token}`)
      .send({
        project: project._id,
        format: 'material',
        description: 'Entrega completa de material',
        workDate: '2026-05-02',
        material: 'Cable de red',
        quantity: 25,
        unit: 'm',
        workers: [
          { name: 'Ana Gomez', hours: 2 },
          { name: 'Luis Perez', hours: 3 }
        ]
      })
      .expect(201);

    expect(created.body.deliveryNote.format).toBe('material');
    expect(created.body.deliveryNote.material).toBe('Cable de red');
    expect(created.body.deliveryNote.quantity).toBe(25);
    expect(created.body.deliveryNote.unit).toBe('m');
    expect(created.body.deliveryNote.workers).toEqual([]);
    expect(created.body.deliveryNote.client).toBe(client._id);
    expect(created.body.deliveryNote.project).toBe(project._id);
    expect(created.body.deliveryNote.company).toBe(user.body.user.company._id);
  });

  it('returns 409 when deleting a signed delivery note', async () => {
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
        description: 'Trabajo firmado',
        workDate: '2026-05-03',
        hours: 4
      })
      .expect(201);

    await DeliveryNote.updateOne(
      { _id: created.body.deliveryNote._id },
      { signed: true, signedAt: new Date('2026-05-04T10:00:00.000Z') }
    );

    const locked = await request(app)
      .delete(`/api/deliverynote/${created.body.deliveryNote._id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(409);

    expect(locked.body.code).toBe('SIGNED_DELIVERY_NOTE_LOCKED');
  });

  it('isolates delivery notes by company in list and detail endpoints', async () => {
    const app = await getApp();
    const { token: tokenA } = await registerAndPrepareUser();
    const clientA = await createClient(tokenA, { name: 'Cliente A', cif: `CA${Date.now().toString().slice(-7)}` });
    const projectA = await createProject(tokenA, clientA._id, { name: 'Proyecto A', projectCode: `A-${Date.now().toString().slice(-6)}` });

    const createdA = await request(app)
      .post('/api/deliverynote')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        project: projectA._id,
        format: 'hours',
        description: 'Trabajo de compania A',
        workDate: '2026-05-05',
        hours: 2
      })
      .expect(201);

    const { token: tokenB } = await registerAndPrepareUser();

    const listB = await request(app).get('/api/deliverynote').set('Authorization', `Bearer ${tokenB}`).expect(200);
    expect(listB.body.deliveryNotes).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ _id: createdA.body.deliveryNote._id })])
    );

    const detailB = await request(app)
      .get(`/api/deliverynote/${createdA.body.deliveryNote._id}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(404);

    expect(detailB.body.code).toBe('DELIVERY_NOTE_NOT_FOUND');
  });

  it('returns 404 when creating a delivery note with a project from another company', async () => {
    const app = await getApp();
    const { token: tokenA } = await registerAndPrepareUser();
    const clientA = await createClient(tokenA, { name: 'Cliente A cross', cif: `XA${Date.now().toString().slice(-7)}` });
    const projectA = await createProject(tokenA, clientA._id, { name: 'Proyecto A cross', projectCode: `XA-${Date.now().toString().slice(-6)}` });
    const { token: tokenB } = await registerAndPrepareUser();

    const crossTenantCreate = await request(app)
      .post('/api/deliverynote')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({
        project: projectA._id,
        format: 'hours',
        description: 'Intento cross tenant',
        workDate: '2026-05-06',
        hours: 1
      })
      .expect(404);

    expect(crossTenantCreate.body.code).toBe('PROJECT_NOT_FOUND');
  });

  it('returns validation error when signed query is not boolean', async () => {
    const app = await getApp();
    const { token } = await registerAndPrepareUser();

    const invalid = await request(app)
      .get('/api/deliverynote?signed=invalid')
      .set('Authorization', `Bearer ${token}`)
      .expect(400);

    expect(invalid.body.code).toBe('VALIDATION_ERROR');
  });
});
