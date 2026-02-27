// src/utils/multer.js
import multer from 'multer';
import { mkdirSync } from 'node:fs';
import { extname, join } from 'node:path';

const uploadDir = join(process.cwd(), 'storage');
mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  }
});

const allowedMimes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

const fileFilter = (req, file, cb) => {
  if (allowedMimes.has(file.mimetype)) {
    return cb(null, true);
  }

  return cb(new Error('Tipo de archivo invalido'));
};

export default multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});