import { TestBed } from '@angular/core/testing';

import { CreateTodoDto } from '../todo.model';
import { TodoFormComponent } from './todo-form.component';

describe('TodoFormComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TodoFormComponent] });
  });

  function createComponent() {
    const fixture = TestBed.createComponent(TodoFormComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('does not emit and shows a validation message when title is empty', () => {
    const fixture = createComponent();
    const emitted: CreateTodoDto[] = [];
    fixture.componentInstance.createTodo.subscribe((dto) => emitted.push(dto));
    const el: HTMLElement = fixture.nativeElement;

    const form = el.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(emitted).toEqual([]);
    expect(el.querySelector('.error')).toBeTruthy();
  });

  it('emits a CreateTodoDto and resets the form on valid submit', () => {
    const fixture = createComponent();
    const emitted: CreateTodoDto[] = [];
    fixture.componentInstance.createTodo.subscribe((dto) => emitted.push(dto));
    const el: HTMLElement = fixture.nativeElement;

    const titleInput = el.querySelector('#title') as HTMLInputElement;
    titleInput.value = 'Buy milk';
    titleInput.dispatchEvent(new Event('input'));

    const descriptionInput = el.querySelector('#description') as HTMLTextAreaElement;
    descriptionInput.value = 'Whole milk';
    descriptionInput.dispatchEvent(new Event('input'));

    const dueDateInput = el.querySelector('#dueDate') as HTMLInputElement;
    dueDateInput.value = '2026-08-20';
    dueDateInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const form = el.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(emitted).toEqual([
      { title: 'Buy milk', description: 'Whole milk', dueDate: '2026-08-20' }
    ]);
    expect((el.querySelector('#title') as HTMLInputElement).value).toBe('');
  });

  it('omits optional fields when left blank', () => {
    const fixture = createComponent();
    const emitted: CreateTodoDto[] = [];
    fixture.componentInstance.createTodo.subscribe((dto) => emitted.push(dto));
    const el: HTMLElement = fixture.nativeElement;

    const titleInput = el.querySelector('#title') as HTMLInputElement;
    titleInput.value = 'Buy milk';
    titleInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const form = el.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));

    expect(emitted).toEqual([{ title: 'Buy milk', description: undefined, dueDate: undefined }]);
  });
});
