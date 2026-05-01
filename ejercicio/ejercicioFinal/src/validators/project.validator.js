import { z } from 'zod';
import { idParamSchema, objectId, paginationQuery } from './common.validator.js';

const text = (field, min = 1) =>
  z
    .string({ error: `${field} es obligatorio` })
    .trim()
    .min(min, `${field} es obligatorio`);

const optionalText = z
  .string()
  .trim()
  .transform((value) => (value === '' ? null : value))
  .nullable()
  .optional();

const address = z.object({
  street: optionalText,
  number: optionalText,
  postal: optionalText,
  city: optionalText,
  province: optionalText
});

const projectBody = z.object({
  client: objectId,
  name: text('El nombre', 2),
  projectCode: text('El codigo del proyecto', 2).transform((value) => value.toUpperCase()),
  address: address.optional(),
  email: z
    .string()
    .trim()
    .email('Email no valido')
    .transform((value) => value.toLowerCase())
    .nullable()
    .optional(),
  notes: optionalText,
  active: z.boolean().optional()
});

export const createProjectSchema = z.object({
  body: projectBody
});

export const updateProjectSchema = z.object({
  params: z.object({ id: objectId }),
  body: projectBody.partial().refine((data) => Object.keys(data).length > 0, {
    message: 'Debe enviar al menos un campo'
  })
});

export const listProjectsSchema = z.object({
  query: z.object({
    ...paginationQuery,
    client: objectId.optional(),
    name: z.string().trim().max(100).optional(),
    active: z
      .enum(['true', 'false'])
      .transform((value) => value === 'true')
      .optional(),
    sort: z.enum(['createdAt', '-createdAt', 'name', '-name', 'projectCode', '-projectCode']).default('-createdAt'),
    sortBy: z.enum(['createdAt', 'name', 'projectCode']).optional(),
    order: z.enum(['asc', 'desc']).default('desc')
  })
});

export const projectIdSchema = idParamSchema;
