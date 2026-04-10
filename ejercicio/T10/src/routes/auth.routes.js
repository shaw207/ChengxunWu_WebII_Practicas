import { Router } from 'express';

import requireAuth from '../middleware/auth.middleware.js';
import User from '../models/user.model.js';
import { comparePassword, hashPassword } from '../utils/password.js';
import { signToken } from '../utils/jwt.js';

const router = Router();

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

router.post('/register', async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || '');

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'name, email y password son requeridos'
      });
    }

    if (name.length < 3 || name.length > 99) {
      return res.status(400).json({
        message: 'El nombre debe tener entre 3 y 99 caracteres'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: 'La contrasena debe tener al menos 8 caracteres'
      });
    }

    const existingUser = await User.findOne({ email }).lean();

    if (existingUser) {
      return res.status(409).json({
        message: 'El email ya esta registrado'
      });
    }

    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    const token = signToken(user);

    res.status(201).json({
      token,
      user: sanitizeUser(user)
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        message: 'El email ya esta registrado'
      });
    }

    res.status(500).json({
      message: 'Error al registrar usuario'
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || '');

    if (!email || !password) {
      return res.status(400).json({
        message: 'email y password son requeridos'
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        message: 'Credenciales invalidas'
      });
    }

    const passwordMatch = await comparePassword(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        message: 'Credenciales invalidas'
      });
    }

    const token = signToken(user);

    res.json({
      token,
      user: sanitizeUser(user)
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al iniciar sesion'
    });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  res.json({
    user: sanitizeUser(req.user)
  });
});

export default router;
