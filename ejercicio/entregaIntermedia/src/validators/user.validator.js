import { z } from 'zod';

const text = (field, min = 1) =>
  z
    .string({
      error: `${field} es obligatorio`
    })
    .trim()
    .min(min, `${field} es obligatorio`);

const optionalText = z
  .string()
  .trim()
  .transform((value) => (value === '' ? null : value))
  .nullable()
  .optional();

const normalizedEmail = z
  .string({
    error: 'El email es obligatorio'
  })
  .trim()
  .email('Email no valido')
  .transform((email) => email.toLowerCase());

const password = z
  .string({
    error: 'La contrasena es obligatoria'
  })
  .min(8, 'La contrasena debe tener al menos 8 caracteres');

const code = z
  .string({
    error: 'El codigo es obligatorio'
  })
  .regex(/^\d{6}$/, 'El codigo debe tener exactamente 6 digitos');

const documentId = (field) =>
  text(field, 5).transform((value) => value.toUpperCase());

const address = z.object({
  street: text('La calle'),
  number: text('El numero'),
  postal: text('El codigo postal'),
  city: text('La ciudad'),
  province: text('La provincia')
});

const partialAddress = z.object({
  street: optionalText,
  number: optionalText,
  postal: optionalText,
  city: optionalText,
  province: optionalText
});

export const registerSchema = z.object({
  body: z.object({
    email: normalizedEmail,
    password
  })
});

export const validationSchema = z.object({
  body: z.object({
    code
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: normalizedEmail,
    password
  })
});

export const personalDataSchema = z.object({
  body: z.object({
    name: text('El nombre', 2),
    lastName: text('Los apellidos', 2),
    nif: documentId('El NIF'),
    address: partialAddress.optional()
  })
});

export const companySchema = z.object({
  body: z.discriminatedUnion('isFreelance', [
    z.object({
      isFreelance: z.literal(false),
      name: text('El nombre de la compania', 2),
      cif: documentId('El CIF'),
      address
    }),
    z.object({
      isFreelance: z.literal(true),
      name: optionalText,
      cif: optionalText.transform((value) => (value ? value.toUpperCase() : value)),
      address: partialAddress.optional()
    })
  ])
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: text('El refresh token')
  })
});

export const deleteUserSchema = z.object({
  query: z.object({
    soft: z
      .enum(['true', 'false'])
      .transform((value) => value === 'true')
      .optional()
  })
});

export const passwordSchema = z.object({
  body: z
    .object({
      currentPassword: password,
      newPassword: password
    })
    .refine((data) => data.currentPassword !== data.newPassword, {
      message: 'La nueva contrasena debe ser diferente de la actual',
      path: ['newPassword']
    })
});

export const inviteSchema = z.object({
  body: z.object({
    email: normalizedEmail,
    password,
    name: optionalText,
    lastName: optionalText,
    nif: optionalText.transform((value) => (value ? value.toUpperCase() : value))
  })
});
