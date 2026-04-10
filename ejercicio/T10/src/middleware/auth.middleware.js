import { verifyToken } from '../utils/jwt.js';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token invalido' });
  }
}

export function socketAuthMiddleware(socket, next) {
  const token = socket.handshake.auth?.token;

  if (!token) {
    return next(new Error('Token no proporcionado'));
  }

  try {
    socket.user = verifyToken(token);
    next();
  } catch (error) {
    next(new Error('Token invalido'));
  }
}

export default requireAuth;
