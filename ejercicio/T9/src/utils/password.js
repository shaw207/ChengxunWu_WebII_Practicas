import bcrypt from 'bcryptjs';

export const hashPassword = async (value) => bcrypt.hash(value, 10);

export const comparePassword = async (value, hashedValue) =>
  bcrypt.compare(value, hashedValue);
