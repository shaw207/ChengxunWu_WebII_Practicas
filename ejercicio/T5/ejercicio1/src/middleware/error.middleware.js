// src/middleware/error.middleware.js
import mongoose from 'mongoose';
import multer from 'multer';

export class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
  }

  static badRequest(msg, details) {
    return new ApiError(400, msg, details);
  }

  static notFound(msg = 'Recurso no encontrado') {
    return new ApiError(404, msg);
  }

  static internal(msg = 'Error interno del servidor') {
    return new ApiError(500, msg);
  }

  static serviceUnavailable(msg = 'Servicio no disponible') {
    return new ApiError(503, msg);
  }
}

export const notFound = (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada', path: req.originalUrl, method: req.method });
};

export const errorHandler = (err, req, res, next) => {
  console.error(err);

  // Errores operacionales creados por la aplicacion
  if (err?.isOperational) {
    return res.status(err.statusCode).json({
      error: err.message,
      ...(err.details && { detalles: err.details })
    });
  }

  // Errores de validacion de Mongoose
  if (err instanceof mongoose.Error.ValidationError) {
    const details = Object.values(err.errors).map((e) => ({
      campo: e.path,
      mensaje: e.message
    }));

    return res.status(400).json({
      error: 'Error de validacion',
      detalles: details
    });
  }

  // ObjectId invalido o casteos invalidos
  if (err instanceof mongoose.Error.CastError) {
    return res.status(400).json({
      error: `Valor invalido para '${err.path}'`
    });
  }

  // Clave unica duplicada
  if (err?.code === 11000) {
    const field = Object.keys(err.keyValue ?? {})[0] ?? 'campo';
    return res.status(409).json({
      error: `Ya existe un registro con ese '${field}'`
    });
  }

  // Errores de Multer
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'El archivo excede el tamano maximo de 5MB'
      });
    }

    return res.status(400).json({ error: err.message });
  }

  if (err?.message === 'Tipo de archivo invalido') {
    return res.status(400).json({
      error: 'Tipo de archivo invalido. Solo se permiten jpeg, png, webp y gif'
    });
  }

  // Errores inesperados
  const isDev = process.env.NODE_ENV === 'development';
  return res.status(500).json({
    error: 'Error interno',
    ...(isDev && { stack: err.stack, message: err.message })
  });
};