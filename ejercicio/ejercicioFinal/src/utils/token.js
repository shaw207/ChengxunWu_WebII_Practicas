import jwt from 'jsonwebtoken';
import { env } from '../config/index.js';
import { AppError } from './AppError.js';

const signToken = (payload, expiresIn) => {
  const normalizedExpiresIn = /^\d+$/.test(String(expiresIn)) ? Number(expiresIn) : expiresIn;
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: normalizedExpiresIn });
};

export const generateAccessToken = (user) => {
  return signToken(
    {
      userId: user._id.toString(),
      role: user.role,
      company: user.company?.toString() || null,
      type: 'access'
    },
    env.JWT_EXPIRES_IN
  );
};

export const generateRefreshToken = (user) => {
  return signToken(
    {
      userId: user._id.toString(),
      role: user.role,
      type: 'refresh'
    },
    env.REFRESH_TOKEN_EXPIRES_IN
  );
};

export const getTokenExpiration = (token) => {
  const decoded = jwt.decode(token);
  return decoded?.exp ? new Date(decoded.exp * 1000) : null;
};

export const generateTokenPair = (user) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  const refreshTokenExpiresAt = getTokenExpiration(refreshToken);

  return {
    accessToken,
    refreshToken,
    refreshTokenExpiresAt
  };
};

export const verifyAccessToken = (token) => {
  const payload = jwt.verify(token, env.JWT_SECRET);

  if (payload.type !== 'access') {
    throw AppError.unauthorized('Token invalido', 'INVALID_TOKEN');
  }

  return payload;
};

export const verifyRefreshToken = (token) => {
  const payload = jwt.verify(token, env.JWT_SECRET);

  if (payload.type !== 'refresh') {
    throw AppError.unauthorized('Refresh token invalido', 'INVALID_REFRESH_TOKEN');
  }

  return payload;
};
