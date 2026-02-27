// src/middleware/validate.middleware.js
import { ZodError } from 'zod';

export const validate = (schema) => async (req, res, next) => {
  try {
    await schema.parseAsync({ body: req.body, query: req.query, params: req.params });
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      const details = err.errors.map(e => ({ campo: e.path.join('.'), mensaje: e.message }));
      return res.status(400).json({ error: 'Error de validación', detalles: details });
    }
    next(err);
  }
};
