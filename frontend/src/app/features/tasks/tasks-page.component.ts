import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import type { TaskView } from '../../core/models/task.models';
import { AuthService } from '../../core/services/auth.service';
import { TaskService } from '../../core/services/task.service';
import { TaskCardComponent } from './task-card/task-card.component';

@Component({
  selector: 'app-tasks-page',
  imports: [CommonModule, TaskCardComponent],
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

  logout(): void {
    this.auth.logout();
    void this.router.navigateByUrl('/login');
  }

  private handleAuthFailure(): void {
    this.auth.logout();
    void this.router.navigateByUrl('/login');
  }

  private parseError(err: HttpErrorResponse): string {
    if (err.status === 0) return 'Não foi possível conectar à API.';
    if (err.status === 401) return 'Sessão expirada. Faça login novamente.';
    return err.error?.message ?? 'Erro inesperado.';
  }
}
