import { z } from 'zod';
import { idParamSchema, objectId, paginationQuery } from './common.validator.js';

const text = (field, min = 1) =>
  z
    .string({ error: `${field} es obligatorio` })
    .trim()
    .min(min, `${field} es obligatorio`);

const materialFields = z.object({
  format: z.literal('material'),
  material: text('El material', 1),
  quantity: z.coerce.number().positive('La cantidad debe ser positiva'),
  unit: text('La unidad', 1)
});

const hoursFields = z.object({
  format: z.literal('hours'),
  hours: z.coerce.number().positive('Las horas deben ser positivas').optional(),
  workers: z
    .array(
      z.object({
        name: text('El nombre del trabajador', 2),
        hours: z.coerce.number().positive('Las horas deben ser positivas')
      })
    )
    .optional()
});

const baseDeliveryNote = z.object({
  project: objectId,
  description: text('La descripcion', 2),
  workDate: z.coerce.date()
});

export const createDeliveryNoteSchema = z.object({
  body: z
    .discriminatedUnion('format', [
      baseDeliveryNote.merge(materialFields),
      baseDeliveryNote.merge(hoursFields)
    ])
    .refine((data) => data.format !== 'hours' || data.hours || data.workers?.length, {
      message: 'Debe indicar horas o trabajadores',
      path: ['hours']
    })
});

export const listDeliveryNotesSchema = z.object({
  query: z.object({
    ...paginationQuery,
    project: objectId.optional(),
    client: objectId.optional(),
    format: z.enum(['material', 'hours']).optional(),
    signed: z
      .enum(['true', 'false'])
      .transform((value) => value === 'true')
      .optional(),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
    sort: z.enum(['workDate', '-workDate', 'createdAt', '-createdAt']).default('-workDate'),
    sortBy: z.enum(['workDate', 'createdAt']).optional(),
    order: z.enum(['asc', 'desc']).default('desc')
  })
});

export const deliveryNoteIdSchema = idParamSchema;
