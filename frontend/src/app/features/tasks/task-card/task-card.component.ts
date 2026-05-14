import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { TASK_STATUS_LABELS, type TaskView } from '../../../core/models/task.models';

@Component({
  selector: 'app-task-card',
  imports: [CommonModule, DatePipe],
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.scss',
})
export class TaskCardComponent {
  readonly task = input.required<TaskView>();
  readonly busy = input(false);

  readonly edited = output<TaskView>();
  readonly removed = output<TaskView>();

  readonly priorityLabel = computed(() => {
    const p = this.task().metadata?.priority;
    if (p === 'high') return 'Alta';
    if (p === 'medium') return 'Média';
    if (p === 'low') return 'Baixa';
    return null;
  });

  readonly statusLabel = computed(() => TASK_STATUS_LABELS[this.task().status]);

  onEdit(): void {
    this.edited.emit(this.task());
  }

  onRemove(): void {
    this.removed.emit(this.task());
  }
}
