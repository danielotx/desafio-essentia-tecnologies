export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'in_progress' | 'done';

export const TASK_STATUSES: TaskStatus[] = ['pending', 'in_progress', 'done'];

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  pending: 'Pendente',
  in_progress: 'Em andamento',
  done: 'Concluída',
};

export interface TaskAttachment {
  name: string;
  url: string;
}

export interface TaskMetadataView {
  tags: string[];
  priority: TaskPriority;
  dueDate: string | null;
  attachments: TaskAttachment[];
  notes: string;
}

export interface TaskView {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  metadata: TaskMetadataView | null;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  status?: TaskStatus;
  tags?: string[];
  priority?: TaskPriority;
  dueDate?: string | null;
  attachments?: TaskAttachment[];
  notes?: string;
}

export type UpdateTaskPayload = Partial<CreateTaskPayload>;
