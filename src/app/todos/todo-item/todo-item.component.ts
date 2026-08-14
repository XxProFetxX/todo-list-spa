import { Component, computed, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Todo, UpdateTodoDto } from '../todo.model';

@Component({
  selector: 'app-todo-item',
  imports: [FormsModule],
  templateUrl: './todo-item.component.html',
  styleUrl: './todo-item.component.css'
})
export class TodoItemComponent {
  readonly todo = input.required<Todo>();

  readonly toggle = output<string>();
  readonly saveEdit = output<{ id: string; dto: UpdateTodoDto }>();
  readonly delete = output<string>();

  protected readonly isEditing = signal(false);
  protected readonly isConfirmingDelete = signal(false);

  protected editTitle = '';
  protected editDescription = '';
  protected editDueDate = '';

  protected readonly dueDateForInput = computed(() => this.todo().dueDate?.slice(0, 10) ?? '');

  protected onToggle(): void {
    this.toggle.emit(this.todo().id);
  }

  protected startEdit(): void {
    const current = this.todo();
    this.editTitle = current.title;
    this.editDescription = current.description ?? '';
    this.editDueDate = current.dueDate?.slice(0, 10) ?? '';
    this.isEditing.set(true);
  }

  protected cancelEdit(): void {
    this.isEditing.set(false);
  }

  protected confirmEdit(): void {
    const title = this.editTitle.trim();
    if (!title) {
      return;
    }

    const dto: UpdateTodoDto = {
      title,
      description: this.editDescription.trim() || undefined,
      dueDate: this.editDueDate || undefined
    };

    this.saveEdit.emit({ id: this.todo().id, dto });
    this.isEditing.set(false);
  }

  protected requestDelete(): void {
    this.isConfirmingDelete.set(true);
  }

  protected cancelDelete(): void {
    this.isConfirmingDelete.set(false);
  }

  protected confirmDelete(): void {
    this.delete.emit(this.todo().id);
    this.isConfirmingDelete.set(false);
  }
}
