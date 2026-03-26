import { z } from 'zod';

const categorySchema = z.enum(['tech', 'science', 'history', 'comedy', 'news']);

export const createPodcastSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'El título debe tener al menos 3 caracteres').trim(),
    description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres').trim(),
    category: categorySchema,
    duration: z.number().int().min(60, 'La duración debe ser de al menos 60 segundos'),
    episodes: z.number().int().min(1).optional()
  })
});

export const updatePodcastSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'El título debe tener al menos 3 caracteres').trim().optional(),
    description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres').trim().optional(),
    category: categorySchema.optional(),
    duration: z.number().int().min(60, 'La duración debe ser de al menos 60 segundos').optional(),
    episodes: z.number().int().min(1).optional()
  }).refine(
    (data) => Object.keys(data).length > 0,
    { message: 'Debes enviar al menos un campo para actualizar' }
  )
});

export const publishPodcastSchema = z.object({
  body: z.object({
    published: z.boolean().optional()
  })
});

export const idParamSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID no válido')
  })
});
