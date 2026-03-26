import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').trim(),
    email: z.string().email('Email no válido').toLowerCase().trim(),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres')
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Email no válido').toLowerCase().trim(),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres')
  })
});
