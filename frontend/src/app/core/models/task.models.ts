export type TaskPriority = 'low' | 'medium' | 'high';

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
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  metadata: TaskMetadataView | null;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  tags?: string[];
  priority?: TaskPriority;
  dueDate?: string | null;
  attachments?: TaskAttachment[];
  notes?: string;
}

export type UpdateTaskPayload = Partial<CreateTaskPayload> & {
  completed?: boolean;
};
