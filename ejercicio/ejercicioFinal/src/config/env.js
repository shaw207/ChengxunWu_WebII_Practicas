import { z } from 'zod';

const optionalUrl = z
  .string()
  .trim()
  .url()
  .optional()
  .or(z.literal('').transform(() => undefined));

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  MONGODB_URI: z.string().trim().min(1, 'MONGODB_URI es obligatorio'),
  CORS_ORIGIN: z.string().trim().default('*'),

  JWT_SECRET: z.string().trim().min(32, 'JWT_SECRET debe tener al menos 32 caracteres'),
  JWT_EXPIRES_IN: z.string().trim().default('15m'),
  REFRESH_TOKEN_EXPIRES_IN: z.string().trim().default('7d'),
  BCRYPT_SALT_ROUNDS: z.coerce.number().int().positive().default(10),

  MAIL_HOST: z.string().trim().optional().default(''),
  MAIL_PORT: z.coerce.number().int().positive().default(587),
  MAIL_SECURE: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
  MAIL_USER: z.string().trim().optional().default(''),
  MAIL_PASS: z.string().trim().optional().default(''),
  MAIL_FROM: z.string().trim().optional().default(''),

  CLOUDINARY_CLOUD_NAME: z.string().trim().optional().default(''),
  CLOUDINARY_API_KEY: z.string().trim().optional().default(''),
  CLOUDINARY_API_SECRET: z.string().trim().optional().default(''),
  CLOUDINARY_FOLDER: z.string().trim().default('bildyapp'),

  SLACK_WEBHOOK_URL: optionalUrl
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Variables de entorno invalidas:');
  parsed.error.issues.forEach((issue) => {
    console.error(`- ${issue.path.join('.') || 'env'}: ${issue.message}`);
  });
  process.exit(1);
}

export const env = parsed.data;
