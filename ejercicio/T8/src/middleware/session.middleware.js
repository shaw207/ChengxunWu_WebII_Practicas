import User from '../models/user.model.js';
import { verifyToken } from '../utils/handleJwt.js';
import { handleHttpError } from '../utils/handleError.js';

const authMiddleware = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      return handleHttpError(res, 'NOT_TOKEN', 401);
    }

    const [scheme, token] = authorization.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return handleHttpError(res, 'INVALID_TOKEN', 401);
    }

    const decoded = verifyToken(token);

    if (!decoded?.userId) {
      return handleHttpError(res, 'INVALID_TOKEN', 401);
    }

    const user = await User.findById(decoded.userId);

    if (!user) {
      return handleHttpError(res, 'USER_NOT_FOUND', 401);
    }

    req.user = user;
    next();
  } catch (err) {
    return handleHttpError(res, 'NOT_SESSION', 401);
  }
};

export default authMiddleware;
