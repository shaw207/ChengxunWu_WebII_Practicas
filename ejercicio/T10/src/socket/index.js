import { Server } from 'socket.io';

import { socketAuthMiddleware } from '../middleware/auth.middleware.js';
import { registerChatHandlers } from './handlers/chat.handler.js';
import { registerRoomHandlers } from './handlers/room.handler.js';

function getUserId(user) {
  return user?._id?.toString?.() || user?.id || null;
}

function ensureUserSocketsMap(io) {
  if (!io.userSockets) {
    io.userSockets = new Map();
  }

  return io.userSockets;
}

function addOnlineUser(io, socket) {
  const userId = getUserId(socket.user);

  if (!userId) {
    return null;
  }

  const userSockets = ensureUserSocketsMap(io);
  const existingSockets = userSockets.get(userId) || new Set();
  const wasOffline = existingSockets.size === 0;

  existingSockets.add(socket.id);
  userSockets.set(userId, existingSockets);

  return { userId, wasOffline };
}

function removeOnlineUser(io, socket) {
  const userId = getUserId(socket.user);

  if (!userId) {
    return null;
  }

  const userSockets = ensureUserSocketsMap(io);
  const existingSockets = userSockets.get(userId);

  if (!existingSockets) {
    return { userId, isOffline: true };
  }

  existingSockets.delete(socket.id);

  if (existingSockets.size === 0) {
    userSockets.delete(userId);
    return { userId, isOffline: true };
  }

  userSockets.set(userId, existingSockets);
  return { userId, isOffline: false };
}

export function setupSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  ensureUserSocketsMap(io);
  io.use(socketAuthMiddleware);

  io.on('connection', (socket) => {
    socket.data.joinedRoomIds = new Set();

    const onlineState = addOnlineUser(io, socket);

    if (onlineState?.wasOffline) {
      io.emit('user:online', { userId: onlineState.userId });
    }

    registerRoomHandlers(io, socket);
    registerChatHandlers(io, socket);

    socket.on('disconnect', () => {
      const offlineState = removeOnlineUser(io, socket);

      if (offlineState?.isOffline) {
        io.emit('user:offline', { userId: offlineState.userId });
      }
    });
  });

  return io;
}
