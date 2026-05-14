import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email('Email inválido').max(180),
  password: z
    .string()
    .min(8, 'A senha deve ter ao menos 8 caracteres')
    .max(72, 'A senha deve ter no máximo 72 caracteres'),
  name: z.string().trim().min(1).max(120).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
