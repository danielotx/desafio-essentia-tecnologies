import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-tasks-placeholder',
  template: `
    <section style="max-width: 640px; margin: 4rem auto; padding: 1.5rem; text-align: center;">
      <h1>Tarefas</h1>
      <p>Esta página será implementada na próxima fase.</p>
      <button (click)="logout()" style="margin-top: 1rem;">Sair</button>
    </section>
  `,
})
export class TasksPagePlaceholder {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  logout(): void {
    this.auth.logout();
    void this.router.navigateByUrl('/login');
  }
}
