import { z } from 'zod';
import { TASK_PRIORITIES } from '../models/task-metadata.model';

export const TASK_STATUSES = ['pending', 'in_progress', 'done'] as const;
export type TaskStatusInput = (typeof TASK_STATUSES)[number];

const attachmentSchema = z.object({
  name: z.string().trim().min(1).max(120),
  url: z.string().trim().url().max(500),
});

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, 'Título é obrigatório').max(200),
  description: z.string().trim().max(2000).optional(),
  status: z.enum(TASK_STATUSES).optional(),
  tags: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
  priority: z.enum(TASK_PRIORITIES).optional(),
  dueDate: z.coerce.date().nullable().optional(),
  attachments: z.array(attachmentSchema).max(20).optional(),
  notes: z.string().trim().max(5000).optional(),
});

export const updateTaskSchema = createTaskSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Informe ao menos um campo para atualizar.',
  });

export const setStatusSchema = z.object({
  status: z.enum(TASK_STATUSES),
});

export const taskIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type SetStatusInput = z.infer<typeof setStatusSchema>;
