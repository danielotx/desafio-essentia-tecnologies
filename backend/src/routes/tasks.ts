import { Router } from 'express';
import { taskController } from '../controllers/task.controller';
import { authenticate } from '../middlewares/authenticate';

const router = Router();

router.use(authenticate);

router.get('/', taskController.list);
router.post('/', taskController.create);
router.put('/:id', taskController.update);
router.patch('/:id/toggle', taskController.toggle);
router.delete('/:id', taskController.remove);

export { router as tasksRouter };
