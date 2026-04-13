import bcryptjs from 'bcryptjs';
import { config } from '../config/index.js';

export const hashPassword = async (plainPassword) => {
  return bcryptjs.hash(plainPassword, config.bcryptSaltRounds);
};

export const comparePassword = async (plainPassword, hashedPassword) => {
  return bcryptjs.compare(plainPassword, hashedPassword);
};
