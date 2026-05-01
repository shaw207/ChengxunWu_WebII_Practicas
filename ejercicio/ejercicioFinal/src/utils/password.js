import bcryptjs from 'bcryptjs';
import { env } from '../config/index.js';

export const hashPassword = async (plainPassword) => {
  return bcryptjs.hash(plainPassword, env.BCRYPT_SALT_ROUNDS);
};

export const comparePassword = async (plainPassword, hashedPassword) => {
  return bcryptjs.compare(plainPassword, hashedPassword);
};
