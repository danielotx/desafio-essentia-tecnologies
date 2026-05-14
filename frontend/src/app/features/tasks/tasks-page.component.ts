import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import type {
  CreateTaskPayload,
  TaskView,
  UpdateTaskPayload,
} from '../../core/models/task.models';
import { AuthService } from '../../core/services/auth.service';
import { TaskService } from '../../core/services/task.service';
import { TaskCardComponent } from './task-card/task-card.component';
import { TaskFormComponent } from './task-form/task-form.component';

@Component({
  selector: 'app-tasks-page',
  imports: [CommonModule, TaskCardComponent, TaskFormComponent],
  templateUrl: './tasks-page.component.html',
  styleUrl: './tasks-page.component.scss',
})
export class TasksPageComponent implements OnInit {
  private readonly taskService = inject(TaskService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly tasks = signal<TaskView[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly busyTaskIds = signal<Set<number>>(new Set());
  readonly formOpen = signal(false);
  readonly editing = signal<TaskView | null>(null);
  readonly submitting = signal(false);

  readonly currentUser = this.auth.user;

  ngOnInit(): void {
    if (!this.currentUser()) {
      this.auth.loadCurrentUser().subscribe({
        error: () => this.handleAuthFailure(),
      });
    }
    this.fetchTasks();
  }

  private fetchTasks(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.taskService
      .list()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ tasks }) => this.tasks.set(tasks),
        error: (err: HttpErrorResponse) => this.errorMessage.set(this.parseError(err)),
      });
  }

  openCreate(): void {
    this.editing.set(null);
    this.formOpen.set(true);
  }

  openEdit(task: TaskView): void {
    this.editing.set(task);
    this.formOpen.set(true);
  }

  closeForm(): void {
    this.formOpen.set(false);
    this.editing.set(null);
  }

  handleSave(payload: CreateTaskPayload | UpdateTaskPayload): void {
    const target = this.editing();
    this.submitting.set(true);

    const request$ = target
      ? this.taskService.update(target.id, payload as UpdateTaskPayload)
      : this.taskService.create(payload as CreateTaskPayload);

    request$.pipe(finalize(() => this.submitting.set(false))).subscribe({
      next: ({ task }) => {
        if (target) {
          this.tasks.update((list) => list.map((t) => (t.id === task.id ? task : t)));
        } else {
          this.tasks.update((list) => [task, ...list]);
        }
        this.closeForm();
      },
      error: (err: HttpErrorResponse) => this.errorMessage.set(this.parseError(err)),
    });
  }

  handleToggle(task: TaskView): void {
    this.markBusy(task.id, true);
    this.taskService
      .toggle(task.id)
      .pipe(finalize(() => this.markBusy(task.id, false)))
      .subscribe({
        next: ({ task: updated }) => {
          this.tasks.update((list) => list.map((t) => (t.id === updated.id ? updated : t)));
        },
        error: (err: HttpErrorResponse) => this.errorMessage.set(this.parseError(err)),
      });
  }

  handleRemove(task: TaskView): void {
    const confirmed = window.confirm(`Remover a tarefa "${task.title}"?`);
    if (!confirmed) return;

    this.markBusy(task.id, true);
    this.taskService
      .remove(task.id)
      .pipe(finalize(() => this.markBusy(task.id, false)))
      .subscribe({
        next: () => {
          this.tasks.update((list) => list.filter((t) => t.id !== task.id));
        },
        error: (err: HttpErrorResponse) => this.errorMessage.set(this.parseError(err)),
      });
  }

  logout(): void {
    this.auth.logout();
    void this.router.navigateByUrl('/login');
  }

  isBusy(taskId: number): boolean {
    return this.busyTaskIds().has(taskId);
  }

  private markBusy(taskId: number, busy: boolean): void {
    this.busyTaskIds.update((set) => {
      const next = new Set(set);
      if (busy) next.add(taskId);
      else next.delete(taskId);
      return next;
    });
  }

  private handleAuthFailure(): void {
    this.auth.logout();
    void this.router.navigateByUrl('/login');
  }

  private parseError(err: HttpErrorResponse): string {
    if (err.status === 0) return 'Não foi possível conectar à API.';
    if (err.status === 401) return 'Sessão expirada. Faça login novamente.';
    if (err.status === 404) return 'Tarefa não encontrada.';
    return err.error?.message ?? 'Erro inesperado.';
  }
}
