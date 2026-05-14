import { Router } from 'express';
import { mongoose } from '../config/mongo';
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
    const mongoState = mongoose.connection.readyState;
    const mongoStatus = mongoState === 1 ? 'ok' : 'unavailable';
    res.json({ mysql: 'ok', mongo: mongoStatus });
  } catch (err) {
    next(err);
  }
});

export { router as healthRouter };
