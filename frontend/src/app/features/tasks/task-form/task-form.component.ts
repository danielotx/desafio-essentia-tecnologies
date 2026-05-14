import { CommonModule } from '@angular/common';
import { Component, OnChanges, computed, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import type {
  CreateTaskPayload,
  TaskPriority,
  TaskView,
  UpdateTaskPayload,
} from '../../../core/models/task.models';

interface TaskFormValue {
  title: string;
  description: string;
  priority: TaskPriority | '';
  dueDate: string;
  tags: string;
  notes: string;
}

@Component({
  selector: 'app-task-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.scss',
})
export class TaskFormComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);

  readonly editing = input<TaskView | null>(null);
  readonly submitting = input(false);

  readonly saved = output<CreateTaskPayload | UpdateTaskPayload>();
  readonly cancelled = output<void>();

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    description: [''],
    priority: ['' as TaskPriority | ''],
    dueDate: [''],
    tags: [''],
    notes: [''],
  });

  readonly mode = computed<'create' | 'edit'>(() => (this.editing() ? 'edit' : 'create'));
  readonly lastEditingId = signal<number | null>(null);

  constructor() {
    queueMicrotask(() => this.syncFromInput());
  }

  ngOnChanges(): void {
    this.syncFromInput();
  }

  private syncFromInput(): void {
    const t = this.editing();
    if (!t) {
      if (this.lastEditingId() !== null) {
        this.form.reset({
          title: '',
          description: '',
          priority: '',
          dueDate: '',
          tags: '',
          notes: '',
        });
        this.lastEditingId.set(null);
      }
      return;
    }

    if (this.lastEditingId() === t.id) return;
    this.lastEditingId.set(t.id);

    this.form.reset({
      title: t.title,
      description: t.description ?? '',
      priority: t.metadata?.priority ?? '',
      dueDate: t.metadata?.dueDate ? t.metadata.dueDate.slice(0, 10) : '',
      tags: (t.metadata?.tags ?? []).join(', '),
      notes: t.metadata?.notes ?? '',
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue() as TaskFormValue;

    const payload: CreateTaskPayload & UpdateTaskPayload = {
      title: value.title.trim(),
      ...(value.description.trim() ? { description: value.description.trim() } : {}),
      ...(value.priority ? { priority: value.priority } : {}),
      ...(value.dueDate ? { dueDate: new Date(value.dueDate).toISOString() } : {}),
      ...(value.tags.trim()
        ? {
            tags: value.tags
              .split(',')
              .map((t) => t.trim())
              .filter((t) => t.length > 0),
          }
        : {}),
      ...(value.notes.trim() ? { notes: value.notes.trim() } : {}),
    };

    this.saved.emit(payload);
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
