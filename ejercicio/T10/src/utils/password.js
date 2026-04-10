import bcryptjs from 'bcryptjs';

export function hashPassword(plainPassword) {
  return bcryptjs.hash(plainPassword, 10);
}

export function comparePassword(plainPassword, hashedPassword) {
  return bcryptjs.compare(plainPassword, hashedPassword);
}
