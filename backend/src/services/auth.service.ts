import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma';
import { signAccessToken } from '../lib/jwt';
import { HttpError } from '../middlewares/error-handler';
import type { LoginInput, RegisterInput } from '../schemas/auth.schema';

const BCRYPT_ROUNDS = 10;

export interface PublicUser {
  id: number;
  email: string;
  name: string | null;
  createdAt: Date;
}

export interface AuthResult {
  user: PublicUser;
  token: string;
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

  async login(input: LoginInput): Promise<AuthResult> {
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user) {
      throw new HttpError(401, 'Credenciais inválidas.');
    }

    const matches = await bcrypt.compare(input.password, user.passwordHash);
    if (!matches) {
      throw new HttpError(401, 'Credenciais inválidas.');
    }

    const token = signAccessToken(user.id);
    return { user: toPublicUser(user), token };
  },
};
