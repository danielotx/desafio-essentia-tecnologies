import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import type { TaskView } from '../../../core/models/task.models';

@Component({
  selector: 'app-task-card',
  imports: [CommonModule, DatePipe],
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.scss',
})
export class TaskCardComponent {
  readonly task = input.required<TaskView>();
  readonly busy = input(false);

  readonly toggled = output<TaskView>();
  readonly edited = output<TaskView>();
  readonly removed = output<TaskView>();

  readonly priorityLabel = computed(() => {
    const p = this.task().metadata?.priority;
    if (p === 'high') return 'Alta';
    if (p === 'medium') return 'Média';
    if (p === 'low') return 'Baixa';
    return null;
  });

  onToggle(): void {
    this.toggled.emit(this.task());
  }

  onEdit(): void {
    this.edited.emit(this.task());
  }

  onRemove(): void {
    this.removed.emit(this.task());
  }
}
