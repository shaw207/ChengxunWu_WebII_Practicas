import express from 'express';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import authRoutes from './routes/auth.routes.js';
import roomsRoutes from './routes/rooms.routes.js';
import { setupSocket } from './socket/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicPath = path.join(__dirname, '../public');

const app = express();
const httpServer = createServer(app);
const io = setupSocket(httpServer);

app.set('io', io);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(publicPath));

app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    socketReady: true,
    message: 'Base structure for T10 is ready.'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomsRoutes);

const PORT = Number(process.env.PORT) || 3000;

httpServer.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});

export { app, httpServer, io };
