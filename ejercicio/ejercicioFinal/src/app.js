import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import routes from './routes/index.js';
import { env, getDatabaseStatus } from './config/index.js';
import { swaggerSpec } from './config/swagger.js';
import { errorHandler, notFound } from './middleware/error-handler.js';
import { apiRateLimit } from './middleware/rate-limit.js';
import { requestLogger } from './middleware/request-logger.js';
import { sanitizeInput } from './middleware/sanitize.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN }));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);
app.use(sanitizeInput);
app.use(apiRateLimit);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @openapi
 * /health:
 *   get:
 *     tags:
 *       - Health
 *     summary: Estado del servidor
 *     responses:
 *       200:
 *         description: Estado de la API y conexion a base de datos
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    db: getDatabaseStatus(),
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.use('/api', routes);
app.use(notFound);
app.use(errorHandler);

export default app;
