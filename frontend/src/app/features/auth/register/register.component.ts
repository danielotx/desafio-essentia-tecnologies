import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['../login/login.component.scss', './register.component.scss'],
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly form = this.fb.nonNullable.group({
    name: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    const { email, password, name } = this.form.getRawValue();
    const payload = { email, password, ...(name.trim() ? { name: name.trim() } : {}) };

    this.auth
      .register(payload)
      .pipe(switchMap(() => this.auth.login({ email, password })))
      .subscribe({
        next: () => {
          void this.router.navigateByUrl('/tasks');
        },
        error: (err: HttpErrorResponse) => {
          this.loading.set(false);
          this.errorMessage.set(this.parseError(err));
        },
      });
  }

  private parseError(err: HttpErrorResponse): string {
    if (err.status === 409) return 'Este email já está cadastrado.';
    if (err.status === 400) {
      const details = err.error?.details;
      if (details) {
        const messages = Object.values(details)
          .flat()
          .filter((m): m is string => typeof m === 'string');
        if (messages.length > 0) return messages.join(' ');
      }
      return 'Dados inválidos.';
    }
    if (err.status === 0) return 'Não foi possível conectar à API.';
    return err.error?.message ?? 'Erro inesperado ao cadastrar.';
  }
}
