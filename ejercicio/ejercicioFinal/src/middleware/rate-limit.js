import rateLimit from 'express-rate-limit';

export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    error: true,
    code: 'TOO_MANY_REQUESTS',
    message: 'Demasiadas peticiones'
  }
});
