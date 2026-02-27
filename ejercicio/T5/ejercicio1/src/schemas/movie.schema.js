// src/schemas/movie.schema.js
import { z } from 'zod';

const currentYear = new Date().getFullYear();
const genres = ['action', 'comedy', 'drama', 'horror', 'scifi'];

export const listMoviesSchema = z.object({
  query: z.object({
    genre: z.enum(genres).optional(),
    search: z.string().trim().min(1).optional(),
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional()
  })
});

export const createMovieSchema = z.object({
  body: z.object({
    title: z.string().trim().min(2, 'title debe tener al menos 2 caracteres'),
    director: z.string().trim().min(1, 'director es requerido'),
    year: z.coerce
      .number()
      .int('year debe ser entero')
      .min(1888, 'year no puede ser menor a 1888')
      .max(currentYear, `year no puede ser mayor a ${currentYear}`),
    genre: z.enum(genres),
    copies: z.coerce.number().int('copies debe ser entero').min(0, 'copies no puede ser negativo').optional()
  })
});

export const updateMovieSchema = z.object({
  body: z
    .object({
      title: z.string().trim().min(2, 'title debe tener al menos 2 caracteres').optional(),
      director: z.string().trim().min(1, 'director no puede estar vacio').optional(),
      year: z.coerce
        .number()
        .int('year debe ser entero')
        .min(1888, 'year no puede ser menor a 1888')
        .max(currentYear, `year no puede ser mayor a ${currentYear}`)
        .optional(),
      genre: z.enum(genres).optional(),
      copies: z.coerce.number().int('copies debe ser entero').min(0, 'copies no puede ser negativo').optional(),
      availableCopies: z.coerce
        .number()
        .int('availableCopies debe ser entero')
        .min(0, 'availableCopies no puede ser negativo')
        .optional(),
      timesRented: z.coerce
        .number()
        .int('timesRented debe ser entero')
        .min(0, 'timesRented no puede ser negativo')
        .optional()
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: 'Debes enviar al menos un campo para actualizar'
    })
});