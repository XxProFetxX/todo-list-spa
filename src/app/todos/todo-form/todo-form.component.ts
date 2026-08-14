import { Component, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { CreateTodoDto } from '../todo.model';

@Component({
  selector: 'app-todo-form',
  imports: [ReactiveFormsModule],
  templateUrl: './todo-form.component.html',
  styleUrl: './todo-form.component.css'
})
export class TodoFormComponent {
  private readonly fb = new FormBuilder();

  readonly createTodo = output<CreateTodoDto>();

  protected readonly form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    description: [''],
    dueDate: ['']
  });

  protected get titleControl() {
    return this.form.controls.title;
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { title, description, dueDate } = this.form.getRawValue();

    const dto: CreateTodoDto = {
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate: dueDate || undefined
    };

    this.createTodo.emit(dto);
    this.form.reset({ title: '', description: '', dueDate: '' });
  }
}
