import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate';

const router = Router();

router.get('/', authenticate, (req, res) => {
  res.json({ user: req.user });
});

export { router as meRouter };
