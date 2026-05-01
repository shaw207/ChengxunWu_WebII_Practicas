import app from './app.js';
import { connectDatabase, env } from './config/index.js';

const startServer = async () => {
  await connectDatabase();

  app.listen(env.PORT, () => {
    console.log(`Servidor en http://localhost:${env.PORT}`);
  });
};

startServer().catch((error) => {
  console.error('Error al iniciar el servidor:', error.message);
  process.exit(1);
});
