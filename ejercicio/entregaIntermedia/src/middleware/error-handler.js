import { ZodError } from 'zod';
import { AppError } from '../utils/AppError.js';

export const notFound = (req, res, next) => {
  next(AppError.notFound(`Ruta ${req.method} ${req.originalUrl}`));
};

export const errorHandler = (err, req, res, next) => {
  console.error(err.message);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: true,
      code: err.code,
      message: err.message,
      details: err.details
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: true,
      code: 'VALIDATION_ERROR',
      message: 'Error de validacion',
      details: err.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message
      }))
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: true,
      code: 'INVALID_TOKEN',
      message: 'Token invalido'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: true,
      code: 'TOKEN_EXPIRED',
      message: 'Token expirado'
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: true,
      code: 'MONGOOSE_VALIDATION_ERROR',
      message: 'Error de validacion',
      details: Object.values(err.errors).map((error) => ({
        field: error.path,
        message: error.message
      }))
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      error: true,
      code: 'INVALID_ID',
      message: 'Identificador invalido'
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'campo';
    return res.status(409).json({
      error: true,
      code: 'DUPLICATE_KEY',
      message: `Ya existe un registro con ese ${field}`
    });
  }

  if (err.name === 'MulterError') {
    return res.status(400).json({
      error: true,
      code: err.code,
      message: err.code === 'LIMIT_FILE_SIZE' ? 'El archivo supera el tamano maximo' : err.message
    });
  }

  return res.status(500).json({
    error: true,
    code: 'INTERNAL_ERROR',
    message: 'Error interno del servidor'
  });
};
