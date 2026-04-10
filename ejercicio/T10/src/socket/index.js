import { Server } from 'socket.io';

import { registerChatHandlers } from './handlers/chat.handler.js';
import { registerRoomHandlers } from './handlers/room.handler.js';

export function setupSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log(`Cliente conectado: ${socket.id}`);

    registerRoomHandlers(io, socket);
    registerChatHandlers(io, socket);

    socket.on('disconnect', () => {
      console.log(`Cliente desconectado: ${socket.id}`);
    });
  });

  return io;
}
