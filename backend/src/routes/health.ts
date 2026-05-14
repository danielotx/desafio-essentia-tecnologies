import { Router } from 'express';
import { prisma } from '../config/prisma';

const router = Router();

router.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

router.get('/db', async (_req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ mysql: 'ok' });
  } catch (err) {
    next(err);
  }
});

export { router as healthRouter };
