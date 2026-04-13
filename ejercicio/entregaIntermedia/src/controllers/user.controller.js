import { randomInt } from 'node:crypto';
import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { comparePassword, hashPassword } from '../utils/password.js';
import { generateTokenPair } from '../utils/token.js';
import { emitUserEvent } from '../services/notification.service.js';

const generateVerificationCode = () => {
  return randomInt(100000, 1000000).toString();
};

const userAuthData = (user) => ({
  id: user._id,
  email: user.email,
  status: user.status,
  role: user.role
});

const saveTokens = async (user) => {
  const tokens = generateTokenPair(user);
  user.refreshToken = tokens.refreshToken;
  user.refreshTokenExpiresAt = tokens.refreshTokenExpiresAt;
  await user.save();

  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken
  };
};

export const registerUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const verifiedUser = await User.findOne({ email, status: 'verified' });

    if (verifiedUser) {
      throw AppError.conflict('El email ya esta registrado', 'EMAIL_ALREADY_EXISTS');
    }

    const hashedPassword = await hashPassword(password);
    const verificationCode = generateVerificationCode();
    let user = await User.findOne({ email }).select('+password +verificationCode +refreshToken +refreshTokenExpiresAt');
    const isNewUser = !user;

    if (!user) {
      user = new User({
        email,
        password: hashedPassword,
        verificationCode,
        verificationAttempts: 3,
        role: 'admin',
        status: 'pending'
      });
    } else {
      user.password = hashedPassword;
      user.verificationCode = verificationCode;
      user.verificationAttempts = 3;
      user.role = 'admin';
      user.status = 'pending';
    }

    await user.save();
    const tokens = await saveTokens(user);

    emitUserEvent('user:registered', {
      userId: user._id.toString(),
      email: user.email
    });

    res.status(isNewUser ? 201 : 200).json({
      user: userAuthData(user),
      ...tokens
    });
  } catch (error) {
    next(error);
  }
};

export const validateEmail = async (req, res, next) => {
  try {
    const { code } = req.body;
    const user = await User.findById(req.user._id).select('+verificationCode');

    if (!user) {
      throw AppError.unauthorized('Usuario no encontrado', 'USER_NOT_FOUND');
    }

    if (user.status === 'verified') {
      return res.json({
        ack: true,
        message: 'Email validado'
      });
    }

    if (user.verificationAttempts <= 0) {
      throw AppError.tooManyRequests('Intentos agotados', 'VALIDATION_ATTEMPTS_EXHAUSTED');
    }

    if (user.verificationCode !== code) {
      user.verificationAttempts = Math.max(user.verificationAttempts - 1, 0);
      await user.save();

      if (user.verificationAttempts === 0) {
        throw AppError.tooManyRequests('Intentos agotados', 'VALIDATION_ATTEMPTS_EXHAUSTED');
      }

      throw AppError.badRequest('Codigo incorrecto', 'INVALID_VERIFICATION_CODE');
    }

    user.status = 'verified';
    user.verificationCode = null;
    user.verificationAttempts = 3;
    await user.save();

    emitUserEvent('user:verified', {
      userId: user._id.toString(),
      email: user.email
    });

    res.json({
      ack: true,
      message: 'Email validado'
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password +refreshToken +refreshTokenExpiresAt');

    if (!user) {
      throw AppError.unauthorized('Credenciales invalidas', 'INVALID_CREDENTIALS');
    }

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      throw AppError.unauthorized('Credenciales invalidas', 'INVALID_CREDENTIALS');
    }

    const tokens = await saveTokens(user);

    res.json({
      user: userAuthData(user),
      ...tokens
    });
  } catch (error) {
    next(error);
  }
};
