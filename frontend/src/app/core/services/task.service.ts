import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type {
  CreateTaskPayload,
  TaskStatus,
  TaskView,
  UpdateTaskPayload,
} from '../models/task.models';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/tasks`;

  list(): Observable<{ tasks: TaskView[] }> {
    return this.http.get<{ tasks: TaskView[] }>(this.baseUrl);
  }

  create(payload: CreateTaskPayload): Observable<{ task: TaskView }> {
    return this.http.post<{ task: TaskView }>(this.baseUrl, payload);
  }

  update(id: number, payload: UpdateTaskPayload): Observable<{ task: TaskView }> {
    return this.http.put<{ task: TaskView }>(`${this.baseUrl}/${id}`, payload);
  }

  setStatus(id: number, status: TaskStatus): Observable<{ task: TaskView }> {
    return this.http.patch<{ task: TaskView }>(`${this.baseUrl}/${id}/status`, { status });
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
