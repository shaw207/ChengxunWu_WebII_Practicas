export const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params
    });

    if (parsed.body) {
      req.body = parsed.body;
    }

    if (parsed.query) {
      req.query = parsed.query;
    }

    if (parsed.params) {
      req.params = parsed.params;
    }

    next();
  } catch (error) {
    const errors = error.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message
    }));

    res.status(400).json({
      error: true,
      message: 'Error de validación',
      details: errors
    });
  }
};
