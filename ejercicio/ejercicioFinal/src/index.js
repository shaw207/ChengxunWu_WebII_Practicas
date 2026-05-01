import { createServer } from 'node:http';
import app from './app.js';
import { connectDatabase, env } from './config/index.js';
import { initSocket } from './config/socket.js';

const startServer = async () => {
  await connectDatabase();
  const httpServer = createServer(app);
  initSocket(httpServer);

  httpServer.listen(env.PORT, () => {
    console.log(`Servidor en http://localhost:${env.PORT}`);
  });
};

startServer().catch((error) => {
  console.error('Error al iniciar el servidor:', error.message);
  process.exit(1);
});
