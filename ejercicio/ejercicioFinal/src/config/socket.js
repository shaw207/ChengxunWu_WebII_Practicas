import { Server } from 'socket.io';
import User from '../models/User.js';
import { logger } from '../services/logger.service.js';
import { verifyAccessToken } from '../utils/token.js';
import { env } from './env.js';

let ioInstance = null;

export const companyRoom = (companyId) => `company:${companyId}`;

const getTokenFromSocket = (socket) => {
  const authToken = socket.handshake.auth?.token;
  const header = socket.handshake.headers?.authorization;

  if (authToken) {
    return authToken;
  }

  if (header?.startsWith('Bearer ')) {
    return header.slice(7);
  }

  return null;
};

export const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN,
      methods: ['GET', 'POST']
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  io.use(async (socket, next) => {
    try {
      const token = getTokenFromSocket(socket);

      if (!token) {
        return next(new Error('TOKEN_REQUIRED'));
      }

      const payload = verifyAccessToken(token);
      const user = await User.findById(payload.userId);

      if (!user) {
        return next(new Error('USER_NOT_FOUND'));
      }

      if (!user.company) {
        return next(new Error('COMPANY_REQUIRED'));
      }

      socket.user = {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        company: user.company.toString()
      };

      socket.join(companyRoom(user.company));
      next();
    } catch (error) {
      next(new Error('INVALID_TOKEN'));
    }
  });

  io.on('connection', (socket) => {
    logger.info(
      {
        socketId: socket.id,
        userId: socket.user.id,
        company: socket.user.company
      },
      'socket connected'
    );

    socket.on('disconnect', (reason) => {
      logger.info({ socketId: socket.id, reason }, 'socket disconnected');
    });
  });

  ioInstance = io;
  return io;
};

export const getSocketServer = () => ioInstance;

export const closeSocket = async () => {
  if (!ioInstance) {
    return;
  }

  await ioInstance.close();
  ioInstance = null;
};
