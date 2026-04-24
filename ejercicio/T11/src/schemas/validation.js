import { ZodError, z } from 'zod';

const formatValidationError = (error) =>
  error.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
  }));

const emptyObjectSchema = z.object({}).passthrough();
const optionalEmptyObjectSchema = emptyObjectSchema.optional().default({});

export const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      params: req.params,
      query: req.query,
    });
    req.validated = parsed;
    req.body = parsed.body;

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
    const parsedBody = schema.parse(req.body);
    req.body = parsedBody;
    req.validated = {
      ...(req.validated ?? {}),
      body: parsedBody,
    };
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

export const buildRequestSchema = ({
  body = optionalEmptyObjectSchema,
  params = optionalEmptyObjectSchema,
  query = optionalEmptyObjectSchema,
}) =>
  z.object({
    body,
    params,
    query,
  });

const emailSchema = z.string().trim().email().transform((value) => value.toLowerCase());
const passwordSchema = z.string().min(8).max(72);
const nameSchema = z.string().trim().min(2).max(100);
const descriptionSchema = z
  .string()
  .trim()
  .max(2000)
  .transform((value) => (value === '' ? undefined : value))
  .optional();

export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const bookIdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const booksQuerySchema = z.object({
  search: z.string().trim().min(1).max(100).optional(),
  author: z.string().trim().min(1).max(100).optional(),
  genre: z.string().trim().min(1).max(100).optional(),
  available: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const statsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(10).default(5),
});

export const createBookSchema = z
  .object({
    isbn: z.string().trim().min(10).max(20),
    title: z.string().trim().min(1).max(255),
    author: z.string().trim().min(1).max(255),
    genre: z.string().trim().min(1).max(100),
    description: descriptionSchema,
    publishedYear: z.coerce.number().int().min(0).max(new Date().getFullYear() + 1),
    copies: z.coerce.number().int().min(1),
    available: z.coerce.number().int().min(0).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.available !== undefined && data.available > data.copies) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['available'],
        message: 'available no puede ser mayor que copies',
      });
    }
  });

export const updateBookSchema = z
  .object({
    isbn: z.string().trim().min(10).max(20).optional(),
    title: z.string().trim().min(1).max(255).optional(),
    author: z.string().trim().min(1).max(255).optional(),
    genre: z.string().trim().min(1).max(100).optional(),
    description: descriptionSchema,
    publishedYear: z.coerce.number().int().min(0).max(new Date().getFullYear() + 1).optional(),
    copies: z.coerce.number().int().min(1).optional(),
    available: z.coerce.number().int().min(0).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Debes enviar al menos un campo para actualizar',
  })
  .superRefine((data, ctx) => {
    if (
      data.available !== undefined &&
      data.copies !== undefined &&
      data.available > data.copies
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['available'],
        message: 'available no puede ser mayor que copies',
      });
    }
  });

export const createLoanSchema = z.object({
  bookId: z.coerce.number().int().positive(),
});

export const loanIdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const createReviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: descriptionSchema,
});

export const reviewIdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});
