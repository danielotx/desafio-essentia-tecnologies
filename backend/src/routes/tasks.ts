import { Router } from 'express';
import { taskController } from '../controllers/task.controller';
import { authenticate } from '../middlewares/authenticate';

const router = Router();

router.use(authenticate);

router.get('/', taskController.list);
router.post('/', taskController.create);

export { router as tasksRouter };
