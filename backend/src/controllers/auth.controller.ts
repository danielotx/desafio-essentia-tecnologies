import type { NextFunction, Request, Response } from 'express';
import { registerSchema } from '../schemas/auth.schema';
import { authService } from '../services/auth.service';

export const authController = {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = registerSchema.parse(req.body);
      const user = await authService.register(input);
      res.status(201).json({ user });
    } catch (err) {
      next(err);
    }
  },
};
