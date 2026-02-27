// src/middleware/error.middleware.js
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

  // Errores operacionales (controlados)
  if (err?.isOperational) {
    return res.status(err.statusCode).json({
      error: err.message,
      ...(err.details && { detalles: err.details })
    });
  }

  // Errores inesperados
  const isDev = process.env.NODE_ENV === 'development';
  return res.status(500).json({
    error: 'Error interno',
    ...(isDev && { stack: err.stack, message: err.message })
  });
};