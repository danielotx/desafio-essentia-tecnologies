import { Router } from 'express';
import { authRouter } from './auth';
import { healthRouter } from './health';
import { meRouter } from './me';
import { tasksRouter } from './tasks';

const router = Router();

router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/me', meRouter);
router.use('/tasks', tasksRouter);

export { router as apiRouter };
