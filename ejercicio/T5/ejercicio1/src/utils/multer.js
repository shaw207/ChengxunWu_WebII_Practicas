
// src/utils/multer.js
import multer from 'multer';
import { join } from 'node:path';
import { mkdirSync } from 'node:fs';

const uploadDir = join(process.cwd(), 'storage');
mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = file.originalname.split('.').pop();
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|gif/;
  cb(allowed.test(file.mimetype) ? null : new Error('Tipo de archivo inválido'), allowed.test(file.mimetype));
};

export default multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});