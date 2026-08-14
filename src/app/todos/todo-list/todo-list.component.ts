import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';

import { TodoFormComponent } from '../todo-form/todo-form.component';
import { TodoItemComponent } from '../todo-item/todo-item.component';
import { CreateTodoDto, Todo, UpdateTodoDto } from '../todo.model';
import { TodoService } from '../todo.service';

@Component({
  selector: 'app-todo-list',
  imports: [TodoFormComponent, TodoItemComponent],
  templateUrl: './todo-list.component.html',
  styleUrl: './todo-list.component.css'
})
export class TodoListComponent implements OnInit {
  private readonly todoService = inject(TodoService);

  protected readonly todos = signal<Todo[]>([]);
  protected readonly overdueOnly = signal(false);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadTodos();
  }

  protected toggleOverdueOnly(): void {
    this.overdueOnly.update((value) => !value);
    this.loadTodos();
  }

  protected loadTodos(): void {
    this.isLoading.set(true);
    const overdueFilter = this.overdueOnly() ? true : undefined;

    this.todoService.getTodos(overdueFilter).subscribe({
      next: (todos) => {
        this.todos.set(todos);
        this.isLoading.set(false);
        this.errorMessage.set(null);
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading.set(false);
        this.errorMessage.set(this.mapError(error));
      }
    });
  }

  protected onCreate(dto: CreateTodoDto): void {
    this.todoService.createTodo(dto).subscribe({
      next: (todo) => {
        this.todos.update((list) => [...list, todo]);
        this.errorMessage.set(null);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(this.mapError(error));
      }
    });
  }

  protected onToggle(id: string): void {
    this.todoService.toggleTodo(id).subscribe({
      next: (updated) => {
        this.replaceTodo(updated);
        this.errorMessage.set(null);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(this.mapError(error));
      }
    });
  }

  protected onSaveEdit(payload: { id: string; dto: UpdateTodoDto }): void {
    this.todoService.updateTodo(payload.id, payload.dto).subscribe({
      next: (updated) => {
        this.replaceTodo(updated);
        this.errorMessage.set(null);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(this.mapError(error));
      }
    });
  }

  protected onDelete(id: string): void {
    this.todoService.deleteTodo(id).subscribe({
      next: () => {
        this.todos.update((list) => list.filter((todo) => todo.id !== id));
        this.errorMessage.set(null);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(this.mapError(error));
      }
    });
  }

  private replaceTodo(updated: Todo): void {
    this.todos.update((list) => list.map((todo) => (todo.id === updated.id ? updated : todo)));
  }

  private mapError(error: HttpErrorResponse): string {
    if (error.status === 404) {
      return 'La tarea solicitada no existe o ya fue eliminada.';
    }
    if (error.status === 400) {
      return 'Los datos ingresados no son válidos. Revisá el formulario e intentá de nuevo.';
    }
    return 'Ocurrió un error inesperado. Intentá nuevamente en unos segundos.';
  }
}
