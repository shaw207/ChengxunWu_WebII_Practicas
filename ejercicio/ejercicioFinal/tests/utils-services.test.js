import { AppError } from '../src/utils/AppError.js';
import { buildPagination, buildSort, paginationMeta } from '../src/utils/query.js';
import { generateDeliveryNotePdf } from '../src/services/pdf.service.js';

describe('utils and services', () => {
  it('builds pagination and sort values', () => {
    expect(buildPagination({ page: 2, limit: 5 })).toEqual({ page: 2, limit: 5, skip: 5 });
    expect(buildSort({ sort: '-createdAt' }, ['createdAt'])).toEqual({ createdAt: -1 });
    expect(buildSort({ sortBy: 'name', order: 'asc' }, ['name'])).toEqual({ name: 1 });
    expect(buildSort({ sort: 'invalid' }, ['createdAt'])).toEqual({ createdAt: -1 });
    expect(paginationMeta({ totalItems: 11, page: 2, limit: 5 })).toEqual({
      totalItems: 11,
      totalPages: 3,
      currentPage: 2,
      limit: 5
    });
  });

  it('creates AppError variants', () => {
    expect(AppError.badRequest().statusCode).toBe(400);
    expect(AppError.unauthorized().statusCode).toBe(401);
    expect(AppError.forbidden().statusCode).toBe(403);
    expect(AppError.notFound('Cliente').statusCode).toBe(404);
    expect(AppError.conflict().statusCode).toBe(409);
    expect(AppError.validation('bad', []).code).toBe('VALIDATION_ERROR');
    expect(AppError.tooManyRequests().statusCode).toBe(429);
  });

  it('generates a pdf buffer for a material delivery note', async () => {
    const buffer = await generateDeliveryNotePdf({
      _id: '507f1f77bcf86cd799439011',
      client: { name: 'Cliente' },
      project: { name: 'Proyecto' },
      user: { email: 'user@test.com' },
      format: 'material',
      workDate: new Date('2026-05-01'),
      description: 'Entrega',
      material: 'Cable',
      quantity: 2,
      unit: 'm',
      signed: false
    });

    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.length).toBeGreaterThan(0);
  });
});
