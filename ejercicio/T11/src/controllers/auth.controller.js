import prisma from '../config/prisma.js';
import { signAccessToken } from '../utils/jwt.js';
import { comparePassword, hashPassword } from '../utils/password.js';

const publicUserSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: publicUserSelect,
    });

    const token = signAccessToken(user);

    res.status(201).json({
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        ...publicUserSelect,
        password: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        error: true,
        message: 'Credenciales invalidas',
      });
    }

    const passwordMatches = await comparePassword(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({
        error: true,
        message: 'Credenciales invalidas',
      });
    }

    const { password: _password, ...safeUser } = user;
    const token = signAccessToken(safeUser);

    return res.json({
      token,
      user: safeUser,
    });
  } catch (error) {
    return next(error);
  }
};

export const getMe = async (req, res) => {
  res.json({
    user: req.user,
  });
};
