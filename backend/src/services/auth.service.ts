import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma';
import { HttpError } from '../middlewares/error-handler';
import type { RegisterInput } from '../schemas/auth.schema';

const BCRYPT_ROUNDS = 10;

export interface PublicUser {
  id: number;
  email: string;
  name: string | null;
  createdAt: Date;
}

function toPublicUser(user: {
  id: number;
  email: string;
  name: string | null;
  createdAt: Date;
}): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
  };
}

export const authService = {
  async register(input: RegisterInput): Promise<PublicUser> {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      throw new HttpError(409, 'Email já cadastrado.');
    }

    const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        name: input.name ?? null,
      },
    });

    return toPublicUser(user);
  },
};
