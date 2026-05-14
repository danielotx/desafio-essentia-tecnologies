import { Router } from 'express';
import { authRouter } from './auth';
import { healthRouter } from './health';
import { meRouter } from './me';

const router = Router();

router.use('/health', healthRouter);
router.use('/auth', authRouter);
router.use('/me', meRouter);

export { router as apiRouter };
