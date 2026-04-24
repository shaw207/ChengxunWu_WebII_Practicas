import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

export const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: true,
    message: 'Ruta no encontrada',
  });
};

export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: true,
      message: 'Error de validacion',
      code: 'VALIDATION_ERROR',
      details: err.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        return res.status(409).json({
          error: true,
          message: 'Conflicto de datos unicos',
          code: err.code,
          target: err.meta?.target ?? null,
        });
      case 'P2003':
        return res.status(400).json({
          error: true,
          message: 'Referencia relacionada no valida',
          code: err.code,
        });
      case 'P2025':
        return res.status(404).json({
          error: true,
          message: 'Registro no encontrado',
          code: err.code,
        });
      default:
        return res.status(400).json({
          error: true,
          message: 'Error de base de datos',
          code: err.code,
        });
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      error: true,
      message: 'Datos invalidos',
    });
  }

  return res.status(err.status || 500).json({
    error: true,
    message: err.message || 'Error interno del servidor',
  });
};
