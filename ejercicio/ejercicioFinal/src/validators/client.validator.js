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

const clientBody = z.object({
  name: text('El nombre', 2),
  cif: text('El CIF', 5).transform((value) => value.toUpperCase()),
  email: z
    .string()
    .trim()
    .email('Email no valido')
    .transform((value) => value.toLowerCase())
    .nullable()
    .optional(),
  phone: optionalText,
  address: address.optional()
});

export const createClientSchema = z.object({
  body: clientBody
});

export const updateClientSchema = z.object({
  params: z.object({ id: objectId }),
  body: clientBody.partial().refine((data) => Object.keys(data).length > 0, {
    message: 'Debe enviar al menos un campo'
  })
});

export const listClientsSchema = z.object({
  query: z.object({
    ...paginationQuery,
    name: z.string().trim().max(100).optional(),
    sort: z.enum(['createdAt', '-createdAt', 'name', '-name', 'cif', '-cif']).default('-createdAt'),
    sortBy: z.enum(['createdAt', 'name', 'cif']).optional(),
    order: z.enum(['asc', 'desc']).default('desc')
  })
});

export const clientIdSchema = idParamSchema;
