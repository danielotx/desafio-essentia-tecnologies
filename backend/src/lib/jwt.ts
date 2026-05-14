import jwt, { type JwtPayload, type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { HttpError } from '../middlewares/error-handler';

export interface AccessTokenPayload extends JwtPayload {
  sub: string;
}

export function signAccessToken(userId: number): string {
  if (!env.JWT_SECRET) {
    throw new HttpError(500, 'JWT_SECRET não configurado no ambiente.');
  }
  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
  };
  return jwt.sign({ sub: String(userId) }, env.JWT_SECRET, options);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  if (!env.JWT_SECRET) {
    throw new HttpError(500, 'JWT_SECRET não configurado no ambiente.');
  }
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    if (typeof decoded === 'string' || !decoded.sub) {
      throw new HttpError(401, 'Token inválido.');
    }
    return decoded as AccessTokenPayload;
  } catch (err) {
    if (err instanceof HttpError) throw err;
    throw new HttpError(401, 'Token inválido ou expirado.');
  }
}
