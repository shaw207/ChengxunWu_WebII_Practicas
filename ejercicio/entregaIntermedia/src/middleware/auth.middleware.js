import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { verifyAccessToken } from '../utils/token.js';

const authMiddleware = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      throw AppError.unauthorized('Token requerido', 'TOKEN_REQUIRED');
    }

    const [scheme, token] = authorization.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw AppError.unauthorized('Token invalido', 'INVALID_TOKEN');
    }

    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.userId);

    if (!user) {
      throw AppError.unauthorized('Usuario no encontrado', 'USER_NOT_FOUND');
    }

    req.user = user;
    req.tokenPayload = payload;
    next();
  } catch (error) {
    next(error);
  }
};

export default authMiddleware;
