import { logHttpRequest } from '../services/logger.service.js';

export const requestLogger = (req, res, next) => {
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const end = process.hrtime.bigint();
    const responseTime = Number(end - start) / 1_000_000;
    logHttpRequest(req, res, Number(responseTime.toFixed(2)));
  });

  next();
};
