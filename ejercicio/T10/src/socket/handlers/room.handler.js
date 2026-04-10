import mongoose from 'mongoose';

import Room from '../../models/room.model.js';

function getUserId(user) {
  return user?._id?.toString?.() || user?.id || null;
}

export function serializeUser(user) {
  return {
    id: getUserId(user),
    name: user?.name,
    email: user?.email
  };
}

function serializeRoom(room) {
  return {
    id: room?._id?.toString?.() || room?.id,
    name: room?.name,
    description: room?.description,
    createdBy: room?.createdBy,
    createdAt: room?.createdAt,
    updatedAt: room?.updatedAt
  };
}

async function getRoomUsers(io, roomId) {
  const sockets = await io.in(roomId).fetchSockets();
  const users = new Map();

  for (const roomSocket of sockets) {
    const user = serializeUser(roomSocket.user);

    if (user.id && !users.has(user.id)) {
      users.set(user.id, user);
    }
  }

  return Array.from(users.values());
}

function sendError(socket, callback, message) {
  if (typeof callback === 'function') {
    callback({ ok: false, message });
    return;
  }

  socket.emit('error', { message });
}

export function registerRoomHandlers(io, socket) {
  socket.on('room:join', async (payload = {}, callback) => {
    try {
      const roomId = String(payload.roomId || '');

      if (!mongoose.Types.ObjectId.isValid(roomId)) {
        return sendError(socket, callback, 'roomId invalido');
      }

      const room = await Room.findById(roomId)
        .populate('createdBy', 'name email')
        .lean();

      if (!room) {
        return sendError(socket, callback, 'Sala no encontrada');
      }

      await socket.join(roomId);
      socket.data.joinedRoomIds.add(roomId);

      const users = await getRoomUsers(io, roomId);
      const roomData = serializeRoom(room);

      socket.emit('room:joined', {
        room: roomData,
        users
      });

      socket.to(roomId).emit('room:user-joined', {
        user: serializeUser(socket.user)
      });

      if (typeof callback === 'function') {
        callback({
          ok: true,
          room: roomData,
          users
        });
      }
    } catch (error) {
      sendError(socket, callback, 'Error al unirse a la sala');
    }
  });

  socket.on('room:leave', async (payload = {}, callback) => {
    try {
      const roomId = String(payload.roomId || '');

      if (!roomId) {
        return sendError(socket, callback, 'roomId requerido');
      }

      await socket.leave(roomId);
      socket.data.joinedRoomIds.delete(roomId);

      socket.to(roomId).emit('room:user-left', {
        user: serializeUser(socket.user)
      });

      if (typeof callback === 'function') {
        callback({
          ok: true,
          roomId
        });
      }
    } catch (error) {
      sendError(socket, callback, 'Error al salir de la sala');
    }
  });

  socket.on('disconnecting', () => {
    for (const roomId of socket.data.joinedRoomIds) {
      socket.to(roomId).emit('room:user-left', {
        user: serializeUser(socket.user)
      });
    }

    socket.data.joinedRoomIds.clear();
  });
}
