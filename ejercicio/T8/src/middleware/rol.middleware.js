import { handleHttpError } from '../utils/handleError.js';

const checkRol = (requiredRole) => (req, res, next) => {
  try {
    if (!req.user || req.user.role !== requiredRole) {
      return handleHttpError(res, 'NOT_ALLOWED', 403);
    }

    next();
  } catch (err) {
    return handleHttpError(res, 'ERROR_PERMISSIONS', 403);
  }
};

export default checkRol;
