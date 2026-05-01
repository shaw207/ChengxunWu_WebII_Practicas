import { z } from 'zod';

export const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID no valido');

export const idParamSchema = z.object({
  params: z.object({
    id: objectId
  })
});

export const softDeleteQuerySchema = z.object({
  query: z.object({
    soft: z
      .enum(['true', 'false'])
      .transform((value) => value === 'true')
      .default('true')
  })
});

export const paginationQuery = {
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10)
};

export const archivedListSchema = z.object({
  query: z.object({
    ...paginationQuery
  })
});
