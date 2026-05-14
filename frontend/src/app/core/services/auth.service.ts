import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import type {
  AuthResult,
  LoginPayload,
  PublicUser,
  RegisterPayload,
} from '../models/auth.models';
import { TokenStorage } from '../storage/token-storage';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly storage = inject(TokenStorage);

  private readonly userSignal = signal<PublicUser | null>(null);
  readonly user = this.userSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.userSignal() !== null);

  register(payload: RegisterPayload): Observable<{ user: PublicUser }> {
    return this.http.post<{ user: PublicUser }>(`${environment.apiUrl}/auth/register`, payload);
  }

  login(payload: LoginPayload): Observable<AuthResult> {
    return this.http.post<AuthResult>(`${environment.apiUrl}/auth/login`, payload).pipe(
      tap((result) => {
        this.storage.setToken(result.token);
        this.userSignal.set(result.user);
      }),
    );
  }

  loadCurrentUser(): Observable<{ user: PublicUser }> {
    return this.http.get<{ user: PublicUser }>(`${environment.apiUrl}/me`).pipe(
      tap((response) => {
        this.userSignal.set(response.user);
      }),
    );
  }

  logout(): void {
    this.storage.clear();
    this.userSignal.set(null);
  }

  hasToken(): boolean {
    return this.storage.token !== null;
  }
}
