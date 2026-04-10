import User from '../models/user.model.js';
import { verifyToken } from '../utils/jwt.js';

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  try {
    const payload = verifyToken(token);

    if (!payload?.id) {
      return res.status(401).json({ message: 'Token invalido' });
    }

    const user = await User.findById(payload.id);

    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    req.user = user;
    req.auth = payload;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token invalido' });
  }
}

export async function socketAuthMiddleware(socket, next) {
  const token = socket.handshake.auth?.token;

  if (!token) {
    return next(new Error('Token no proporcionado'));
  }

  try {
    const payload = verifyToken(token);

    if (!payload?.id) {
      return next(new Error('Token invalido'));
    }

    const user = await User.findById(payload.id).lean();

    if (!user) {
      return next(new Error('Usuario no encontrado'));
    }

    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Token invalido'));
  }
}

export default requireAuth;
