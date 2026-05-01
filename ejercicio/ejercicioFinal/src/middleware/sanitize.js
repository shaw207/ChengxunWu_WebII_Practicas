import mongoSanitize from 'express-mongo-sanitize';

export const sanitizeInput = (req, res, next) => {
  const options = { replaceWith: '_' };

  if (req.body) {
    req.body = mongoSanitize.sanitize(req.body, options);
  }

  if (req.query) {
    const query = mongoSanitize.sanitize(req.query, options);
    Object.defineProperty(req, 'query', {
      value: query,
      configurable: true,
      writable: true
    });
  }

  next();
};
