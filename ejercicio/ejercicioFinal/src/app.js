import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import routes from './routes/index.js';
import { env, getDatabaseStatus } from './config/index.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN }));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    db: getDatabaseStatus(),
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.use('/api', routes);

export default app;
