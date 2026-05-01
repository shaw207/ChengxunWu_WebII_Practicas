import pino from 'pino';
import { env } from '../config/index.js';

export const logger = pino({
  level: env.NODE_ENV === 'test' ? 'silent' : 'info',
  timestamp: pino.stdTimeFunctions.isoTime,
  base: {
    service: 'bildyapp-api',
    environment: env.NODE_ENV
  }
});

export const logHttpRequest = (req, res, responseTime) => {
  logger.info(
    {
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      responseTime
    },
    'http request'
  );
};
