// src/schemas/task.schema.js
import { z } from 'zod';

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must have at least 3 characters').max(100),
    description: z.string().max(500).optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    completed: z.boolean().optional(),
    dueDate: z.coerce.date().optional().refine((d) => !d || d > new Date(), { message: 'Due date must be in the future' }),
    tags: z.array(z.string().min(1)).max(5).optional(),
  }),
});

export const updateTaskSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(100).optional(),
    description: z.string().max(500).optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    completed: z.boolean().optional(),
    dueDate: z.coerce.date().optional().refine((d) => !d || d > new Date(), { message: 'Due date must be in the future' }),
    tags: z.array(z.string().min(1)).max(5).optional(),
  }),
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});
