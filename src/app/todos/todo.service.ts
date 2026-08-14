import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { CreateTodoDto, Todo, UpdateTodoDto } from './todo.model';

@Injectable({ providedIn: 'root' })
export class TodoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/todos`;

  getTodos(overdue?: boolean): Observable<Todo[]> {
    let params = new HttpParams();
    if (overdue !== undefined) {
      params = params.set('overdue', overdue);
    }
    return this.http.get<Todo[]>(this.baseUrl, { params });
  }

  getTodo(id: string): Observable<Todo> {
    return this.http.get<Todo>(`${this.baseUrl}/${id}`);
  }

  createTodo(dto: CreateTodoDto): Observable<Todo> {
    return this.http.post<Todo>(this.baseUrl, dto);
  }

  updateTodo(id: string, dto: UpdateTodoDto): Observable<Todo> {
    return this.http.patch<Todo>(`${this.baseUrl}/${id}`, dto);
  }

  toggleTodo(id: string): Observable<Todo> {
    return this.http.patch<Todo>(`${this.baseUrl}/${id}/toggle`, {});
  }

  deleteTodo(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
