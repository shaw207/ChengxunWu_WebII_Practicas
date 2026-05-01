import { createServer } from 'node:http';
import app from './app.js';
import { connectDatabase, disconnectDatabase, env } from './config/index.js';
import { closeSocket, initSocket } from './config/socket.js';
import { logger } from './services/logger.service.js';

const startServer = async () => {
  await connectDatabase();
  const httpServer = createServer(app);
  initSocket(httpServer);

  httpServer.listen(env.PORT, () => {
    logger.info({ port: env.PORT }, 'server started');
  });

  const shutdown = async (signal) => {
    logger.info({ signal }, 'graceful shutdown started');

    httpServer.close(async () => {
      try {
        await closeSocket();
        await disconnectDatabase();
        logger.info('graceful shutdown finished');
        process.exit(0);
      } catch (error) {
        logger.error({ err: error }, 'graceful shutdown failed');
        process.exit(1);
      }
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

startServer().catch((error) => {
  logger.error({ err: error }, 'server startup failed');
  process.exit(1);
});
