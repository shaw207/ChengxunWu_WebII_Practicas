import mongoose from 'mongoose';

import Message from '../../models/message.model.js';
import Room from '../../models/room.model.js';
import { serializeUser } from './room.handler.js';

function sendError(socket, callback, message) {
  if (typeof callback === 'function') {
    callback({ ok: false, message });
    return;
  }

  socket.emit('error', { message });
}

async function roomExists(roomId) {
  return Room.exists({ _id: roomId });
}

export function registerChatHandlers(io, socket) {
  socket.on('chat:message', async (payload = {}, callback) => {
    try {
      const roomId = String(payload.roomId || '');
      const content = String(payload.content || '').trim();

      if (!mongoose.Types.ObjectId.isValid(roomId)) {
        return sendError(socket, callback, 'roomId invalido');
      }

      if (!socket.data.joinedRoomIds.has(roomId)) {
        return sendError(socket, callback, 'Debes unirte a la sala antes de enviar mensajes');
      }

      if (!content) {
        return sendError(socket, callback, 'El mensaje no puede estar vacio');
      }

      const existingRoom = await roomExists(roomId);

      if (!existingRoom) {
        return sendError(socket, callback, 'Sala no encontrada');
      }

      const message = await Message.create({
        content,
        roomId,
        userId: socket.user._id || socket.user.id
      });

      const messageData = {
        id: message._id.toString(),
        roomId,
        user: serializeUser(socket.user),
        content: message.content,
        timestamp: message.createdAt
      };

      io.to(roomId).emit('chat:message', messageData);

      if (typeof callback === 'function') {
        callback({
          ok: true,
          message: messageData
        });
      }
    } catch (error) {
      sendError(socket, callback, 'Error al enviar mensaje');
    }
  });

  socket.on('chat:typing', async (payload = {}) => {
    try {
      const roomId = String(payload.roomId || '');

      if (!mongoose.Types.ObjectId.isValid(roomId)) {
        return;
      }

      if (!socket.data.joinedRoomIds.has(roomId)) {
        return;
      }

      const existingRoom = await roomExists(roomId);

      if (!existingRoom) {
        return;
      }

      socket.to(roomId).emit('chat:typing', {
        roomId,
        user: serializeUser(socket.user)
      });
    } catch (error) {
    }
  });
}
