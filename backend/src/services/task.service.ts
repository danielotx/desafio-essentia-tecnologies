import type { Task, TaskStatus } from '@prisma/client';
import { prisma } from '../config/prisma';
import { logger } from '../config/logger';
import { HttpError } from '../middlewares/error-handler';
import { TaskMetadata } from '../models/task-metadata.model';
import type { CreateTaskInput, UpdateTaskInput } from '../schemas/task.schema';

export const TASK_STATUS_ORDER: Record<TaskStatus, number> = {
  pending: 0,
  in_progress: 1,
  done: 2,
};

export interface TaskMetadataView {
  tags: string[];
  priority: 'low' | 'medium' | 'high';
  dueDate: Date | null;
  attachments: Array<{ name: string; url: string }>;
  notes: string;
}

export interface TaskView {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
  metadata: TaskMetadataView | null;
}

function toTaskView(task: Task, metadata: TaskMetadataView | null): TaskView {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    metadata,
  };
}

async function readMetadata(taskId: number): Promise<TaskMetadataView | null> {
  const doc = await TaskMetadata.findOne({ taskId }).lean();
  if (!doc) return null;
  return {
    tags: doc.tags,
    priority: doc.priority,
    dueDate: doc.dueDate ?? null,
    attachments: doc.attachments.map((a) => ({ name: a.name, url: a.url })),
    notes: doc.notes,
  };
}

function hasMetadataFields(input: Partial<CreateTaskInput>): boolean {
  return (
    input.tags !== undefined ||
    input.priority !== undefined ||
    input.dueDate !== undefined ||
    input.attachments !== undefined ||
    input.notes !== undefined
  );
}

function buildMetadataPayload(input: Partial<CreateTaskInput>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  if (input.tags !== undefined) payload.tags = input.tags;
  if (input.priority !== undefined) payload.priority = input.priority;
  if (input.dueDate !== undefined) payload.dueDate = input.dueDate;
  if (input.attachments !== undefined) payload.attachments = input.attachments;
  if (input.notes !== undefined) payload.notes = input.notes;
  return payload;
}

export const taskService = {
  async create(userId: number, input: CreateTaskInput): Promise<TaskView> {
    const task = await prisma.task.create({
      data: {
        userId,
        title: input.title,
        description: input.description ?? null,
        status: input.status ?? 'pending',
      },
    });

    let metadata: TaskMetadataView | null = null;
    if (hasMetadataFields(input)) {
      try {
        const doc = await TaskMetadata.create({
          taskId: task.id,
          ...buildMetadataPayload(input),
        });
        metadata = {
          tags: doc.tags,
          priority: doc.priority,
          dueDate: doc.dueDate ?? null,
          attachments: doc.attachments.map((a) => ({ name: a.name, url: a.url })),
          notes: doc.notes,
        };
      } catch (err) {
        await prisma.task.delete({ where: { id: task.id } }).catch((rollbackErr) => {
          logger.error(
            { err: rollbackErr, taskId: task.id },
            'Falha ao reverter Task após erro no MongoDB',
          );
        });
        throw err;
      }
    }

    return toTaskView(task, metadata);
  },

  async list(userId: number): Promise<TaskView[]> {
    const tasks = await prisma.task.findMany({
      where: { userId },
      orderBy: [{ createdAt: 'desc' }],
    });

    if (tasks.length === 0) return [];

    tasks.sort((a, b) => {
      const statusDiff = TASK_STATUS_ORDER[a.status] - TASK_STATUS_ORDER[b.status];
      if (statusDiff !== 0) return statusDiff;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    const ids = tasks.map((t) => t.id);
    const docs = await TaskMetadata.find({ taskId: { $in: ids } }).lean();
    const metaMap = new Map(
      docs.map((d) => [
        d.taskId,
        {
          tags: d.tags,
          priority: d.priority,
          dueDate: d.dueDate ?? null,
          attachments: d.attachments.map((a) => ({ name: a.name, url: a.url })),
          notes: d.notes,
        } satisfies TaskMetadataView,
      ]),
    );

    return tasks.map((task) => toTaskView(task, metaMap.get(task.id) ?? null));
  },

  async findOwnedTask(userId: number, taskId: number): Promise<Task> {
    const task = await prisma.task.findFirst({ where: { id: taskId, userId } });
    if (!task) {
      throw new HttpError(404, 'Tarefa não encontrada.');
    }
    return task;
  },

  async getById(userId: number, taskId: number): Promise<TaskView> {
    const task = await this.findOwnedTask(userId, taskId);
    const metadata = await readMetadata(task.id);
    return toTaskView(task, metadata);
  },

  async update(userId: number, taskId: number, input: UpdateTaskInput): Promise<TaskView> {
    await this.findOwnedTask(userId, taskId);

    const mysqlPatch: Record<string, unknown> = {};
    if (input.title !== undefined) mysqlPatch.title = input.title;
    if (input.description !== undefined) mysqlPatch.description = input.description ?? null;
    if (input.status !== undefined) mysqlPatch.status = input.status;

    let updatedTask: Task;
    if (Object.keys(mysqlPatch).length > 0) {
      updatedTask = await prisma.task.update({ where: { id: taskId }, data: mysqlPatch });
    } else {
      updatedTask = await this.findOwnedTask(userId, taskId);
    }

    if (hasMetadataFields(input)) {
      await TaskMetadata.updateOne(
        { taskId },
        { $set: buildMetadataPayload(input) },
        { upsert: true },
      );
    }

    const metadata = await readMetadata(taskId);
    return toTaskView(updatedTask, metadata);
  },

  async setStatus(userId: number, taskId: number, status: TaskStatus): Promise<TaskView> {
    await this.findOwnedTask(userId, taskId);
    const updated = await prisma.task.update({
      where: { id: taskId },
      data: { status },
    });
    const metadata = await readMetadata(taskId);
    return toTaskView(updated, metadata);
  },

  async remove(userId: number, taskId: number): Promise<void> {
    await this.findOwnedTask(userId, taskId);
    await prisma.task.delete({ where: { id: taskId } });
    await TaskMetadata.deleteOne({ taskId }).catch((err) => {
      logger.error(
        { err, taskId },
        'Falha ao remover metadados da tarefa no MongoDB; estado pode ficar órfão',
      );
    });
  },
};
