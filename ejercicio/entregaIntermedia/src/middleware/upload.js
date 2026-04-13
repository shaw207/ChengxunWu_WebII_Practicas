import multer from 'multer';
import { mkdirSync } from 'node:fs';
import { extname, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { config } from '../config/index.js';
import { AppError } from '../utils/AppError.js';

const uploadPath = resolve(import.meta.dirname, '..', '..', config.uploadsDir);

mkdirSync(uploadPath, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, uploadPath);
  },
  filename: (req, file, callback) => {
    const extension = extname(file.originalname).toLowerCase();
    callback(null, `${randomUUID()}${extension}`);
  }
});

const fileFilter = (req, file, callback) => {
  if (!file.mimetype.startsWith('image/')) {
    return callback(AppError.badRequest('Solo se permiten imagenes', 'INVALID_FILE_TYPE'));
  }

  callback(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});
