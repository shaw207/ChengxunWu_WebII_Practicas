import jwt from 'jsonwebtoken';

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    const error = new Error('JWT_SECRET no configurado');
    error.status = 500;
    throw error;
  }

  return process.env.JWT_SECRET;
};

const getJwtExpiresIn = () => process.env.JWT_EXPIRES_IN || '2h';

export const signAccessToken = (user) =>
  jwt.sign(
    {
      sub: String(user.id),
      email: user.email,
      role: user.role,
    },
    getJwtSecret(),
    {
      expiresIn: getJwtExpiresIn(),
    },
  );

export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, getJwtSecret());
  } catch {
    return null;
  }
};
