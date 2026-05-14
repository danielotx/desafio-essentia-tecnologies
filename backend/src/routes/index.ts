import { Router } from 'express';
import { authRouter } from './auth';
import { healthRouter } from './health';

const router = Router();

router.use('/health', healthRouter);
router.use('/auth', authRouter);

export { router as apiRouter };
