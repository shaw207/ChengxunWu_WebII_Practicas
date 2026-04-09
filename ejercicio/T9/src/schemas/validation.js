import { ZodError, z } from 'zod';

const formatValidationError = (error) =>
  error.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
  }));

export const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (parsed.body) {
      req.body = parsed.body;
    }

    if (parsed.params) {
      req.params = parsed.params;
    }

    if (parsed.query) {
      req.query = parsed.query;
    }

    next();
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: true,
        message: 'Error de validacion',
        code: 'VALIDATION_ERROR',
        details: formatValidationError(error),
      });
    }

    return next(error);
  }
};

export const validateBody = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: true,
        message: 'Error de validacion',
        code: 'VALIDATION_ERROR',
        details: formatValidationError(error),
      });
    }

    return next(error);
  }
};

const emailSchema = z.string().trim().email().transform((value) => value.toLowerCase());
const passwordSchema = z.string().min(8).max(72);
const nameSchema = z.string().trim().min(2).max(100);

export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});
