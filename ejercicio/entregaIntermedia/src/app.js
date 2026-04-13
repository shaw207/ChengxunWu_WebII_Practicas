import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import { resolve } from 'node:path';
import routes from './routes/index.js';
import { config } from './config/index.js';
import { errorHandler, notFound } from './middleware/error-handler.js';

const app = express();

const sanitizeRequest = (req, res, next) => {
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

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(sanitizeRequest);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: {
      error: true,
      code: 'TOO_MANY_REQUESTS',
      message: 'Demasiadas peticiones'
    }
  })
);

app.use('/uploads', express.static(resolve(import.meta.dirname, '..', config.uploadsDir)));

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: config.nodeEnv
  });
});

app.use('/api', routes);
app.use(notFound);
app.use(errorHandler);

export default app;
