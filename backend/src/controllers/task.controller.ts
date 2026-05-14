import type { NextFunction, Request, Response } from 'express';
import { HttpError } from '../middlewares/error-handler';
import {
  createTaskSchema,
  setStatusSchema,
  taskIdParamSchema,
  updateTaskSchema,
} from '../schemas/task.schema';
import { taskService } from '../services/task.service';

function requireUserId(req: Request): number {
  if (!req.user) {
    throw new HttpError(401, 'Autenticação necessária.');
  }
  return req.user.id;
}

export const taskController = {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = requireUserId(req);
      const input = createTaskSchema.parse(req.body);
      const task = await taskService.create(userId, input);
      res.status(201).json({ task });
    } catch (err) {
      next(err);
    }
  },

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = requireUserId(req);
      const tasks = await taskService.list(userId);
      res.json({ tasks });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = requireUserId(req);
      const { id } = taskIdParamSchema.parse(req.params);
      const input = updateTaskSchema.parse(req.body);
      const task = await taskService.update(userId, id, input);
      res.json({ task });
    } catch (err) {
      next(err);
    }
  },

  async setStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = requireUserId(req);
      const { id } = taskIdParamSchema.parse(req.params);
      const { status } = setStatusSchema.parse(req.body);
      const task = await taskService.setStatus(userId, id, status);
      res.json({ task });
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = requireUserId(req);
      const { id } = taskIdParamSchema.parse(req.params);
      await taskService.remove(userId, id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
