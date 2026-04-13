import mongoose from 'mongoose';
import { z } from 'zod';

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().int().positive().default(3000),
    MONGODB_URI: z.string().trim().optional(),
    MONGO_URI: z.string().trim().optional(),
    JWT_SECRET: z.string().trim().min(1),
    JWT_EXPIRES_IN: z.string().trim().default('15m'),
    REFRESH_TOKEN_EXPIRES_IN: z.string().trim().default('7d'),
    UPLOADS_DIR: z.string().trim().default('uploads'),
    BCRYPT_SALT_ROUNDS: z.coerce.number().int().positive().default(10)
  })
  .refine((env) => env.MONGODB_URI || env.MONGO_URI, {
    message: 'MONGODB_URI o MONGO_URI es obligatorio',
    path: ['MONGODB_URI']
  });

const env = envSchema.parse(process.env);

export const config = {
  nodeEnv: env.NODE_ENV,
  port: env.PORT,
  mongoUri: env.MONGODB_URI || env.MONGO_URI,
  jwtSecret: env.JWT_SECRET,
  jwtExpiresIn: env.JWT_EXPIRES_IN,
  refreshTokenExpiresIn: env.REFRESH_TOKEN_EXPIRES_IN,
  uploadsDir: env.UPLOADS_DIR,
  bcryptSaltRounds: env.BCRYPT_SALT_ROUNDS
};

export const connectDB = async () => {
  await mongoose.connect(config.mongoUri);
  console.log('MongoDB conectado');
};
