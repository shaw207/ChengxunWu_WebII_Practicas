import { AppError } from '../utils/AppError.js';

const roleMiddleware = (roles) => (req, res, next) => {
  try {
    if (!req.user) {
      throw AppError.unauthorized('Usuario no autenticado', 'USER_NOT_AUTHENTICATED');
    }

    if (!roles.includes(req.user.role)) {
      throw AppError.forbidden('No tienes permisos para realizar esta accion', 'ROLE_FORBIDDEN');
    }

    next();
  } catch (error) {
    next(error);
  }
};

export default roleMiddleware;
