import { Injectable } from '@angular/core';

const TOKEN_KEY = 'techx.token';

@Injectable({ providedIn: 'root' })
export class TokenStorage {
  get token(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  }

  setToken(token: string): void {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      // Ignore: localStorage indisponível (ex: modo anônimo do Safari).
    }
  }

  clear(): void {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      // Ignore.
    }
  }
}
