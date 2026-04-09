import prisma from '../config/prisma.js';
import { verifyAccessToken } from '../utils/jwt.js';

export const authRequired = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith('Bearer ')) {
      return res.status(401).json({
        error: true,
        message: 'Token requerido',
      });
    }

    const token = authorization.split(' ').pop();
    const payload = verifyAccessToken(token);

    if (!payload?.sub) {
      return res.status(401).json({
        error: true,
        message: 'Token invalido',
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(payload.sub) },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        error: true,
        message: 'Usuario no autenticado',
      });
    }

    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
};

export const allowRoles = (roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: true,
      message: 'Usuario no autenticado',
    });
  }

  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      error: true,
      message: 'No autorizado',
    });
  }

  return next();
};
