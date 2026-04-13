export const validate = (schema) => async (req, res, next) => {
  try {
    const data = await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params
    });

    if (data.body) {
      req.body = data.body;
    }

    if (data.query) {
      Object.defineProperty(req, 'query', {
        value: data.query,
        configurable: true,
        writable: true
      });
    }

    if (data.params) {
      req.params = data.params;
    }

    next();
  } catch (error) {
    next(error);
  }
};
