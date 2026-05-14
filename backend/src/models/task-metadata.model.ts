import { Schema, model, type InferSchemaType } from 'mongoose';

export const TASK_PRIORITIES = ['low', 'medium', 'high'] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

const attachmentSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const taskMetadataSchema = new Schema(
  {
    taskId: { type: Number, required: true, unique: true, index: true },
    tags: { type: [String], default: [] },
    priority: {
      type: String,
      enum: TASK_PRIORITIES,
      default: 'medium',
    },
    dueDate: { type: Date, default: null },
    attachments: { type: [attachmentSchema], default: [] },
    notes: { type: String, default: '' },
  },
  {
    timestamps: true,
    collection: 'task_metadata',
  },
);

export type TaskMetadataDocument = InferSchemaType<typeof taskMetadataSchema>;

export const TaskMetadata = model<TaskMetadataDocument>('TaskMetadata', taskMetadataSchema);
