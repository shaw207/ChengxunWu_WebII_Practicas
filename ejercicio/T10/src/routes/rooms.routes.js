import { Router } from 'express';
import mongoose from 'mongoose';

import requireAuth from '../middleware/auth.middleware.js';
import Message from '../models/message.model.js';
import Room from '../models/room.model.js';

const router = Router();

function isValidObjectId(value) {
  return mongoose.Types.ObjectId.isValid(value);
}

function sanitizeRoom(room) {
  return {
    id: room._id?.toString?.() || room.id,
    name: room.name,
    description: room.description,
    createdBy: room.createdBy,
    createdAt: room.createdAt,
    updatedAt: room.updatedAt
  };
}

router.get('/', requireAuth, async (req, res) => {
  try {
    const rooms = await Room.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      rooms: rooms.map((room) => sanitizeRoom(room))
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al listar salas'
    });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const description = String(req.body.description || '').trim();

    if (!name) {
      return res.status(400).json({
        message: 'El nombre de la sala es requerido'
      });
    }

    const existingRoom = await Room.findOne({ name }).lean();

    if (existingRoom) {
      return res.status(409).json({
        message: 'Ya existe una sala con ese nombre'
      });
    }

    const room = await Room.create({
      name,
      description,
      createdBy: req.user._id
    });

    await room.populate('createdBy', 'name email');

    res.status(201).json({
      room: sanitizeRoom(room)
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        message: 'Ya existe una sala con ese nombre'
      });
    }

    if (error instanceof mongoose.Error.ValidationError) {
      const message = Object.values(error.errors)[0]?.message || 'Datos invalidos';
      return res.status(400).json({ message });
    }

    res.status(500).json({
      message: 'Error al crear sala'
    });
  }
});

router.get('/:id/messages', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const limitValue = Number(req.query.limit);
    const limit = Number.isFinite(limitValue)
      ? Math.min(Math.max(limitValue, 1), 100)
      : 50;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        message: 'room id invalido'
      });
    }

    const room = await Room.findById(id)
      .populate('createdBy', 'name email')
      .lean();

    if (!room) {
      return res.status(404).json({
        message: 'Sala no encontrada'
      });
    }

    const messages = await Message.find({ roomId: id })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.json({
      room: sanitizeRoom(room),
      messages: messages.reverse().map((message) => ({
        id: message._id.toString(),
        content: message.content,
        roomId: message.roomId.toString(),
        user: message.userId,
        timestamp: message.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener historial de mensajes'
    });
  }
});

export default router;
