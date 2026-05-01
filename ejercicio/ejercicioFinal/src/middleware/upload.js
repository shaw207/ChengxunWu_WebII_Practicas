import multer from 'multer';
import { AppError } from '../utils/AppError.js';

const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];

export const uploadSignature = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1
  },
  fileFilter: (req, file, cb) => {
    if (!allowedImageTypes.includes(file.mimetype)) {
      return cb(AppError.badRequest('Solo se permiten imagenes jpeg, png o webp', 'INVALID_FILE_TYPE'));
    }

    cb(null, true);
  }
});

export const requireFile = (fieldName) => (req, res, next) => {
  if (!req.file) {
    return next(AppError.badRequest(`El archivo ${fieldName} es obligatorio`, 'FILE_REQUIRED'));
  }

  next();
};
