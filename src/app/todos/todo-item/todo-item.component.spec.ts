import { TestBed } from '@angular/core/testing';

import { Todo } from '../todo.model';
import { TodoItemComponent } from './todo-item.component';

describe('TodoItemComponent', () => {
  const baseTodo: Todo = {
    id: '1',
    title: 'Buy milk',
    description: 'Whole milk',
    completed: false,
    createdAt: '2026-08-01T00:00:00.000Z',
    dueDate: '2026-08-01',
    overdue: false
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TodoItemComponent] });
  });

  function createComponent(todo: Todo = baseTodo) {
    const fixture = TestBed.createComponent(TodoItemComponent);
    fixture.componentRef.setInput('todo', todo);
    fixture.detectChanges();
    return fixture;
  }

  it('renders title, description and due date', () => {
    const fixture = createComponent();
    const el: HTMLElement = fixture.nativeElement;

    expect(el.querySelector('.todo-title')?.textContent).toContain('Buy milk');
    expect(el.querySelector('.todo-description')?.textContent).toContain('Whole milk');
    expect(el.querySelector('.todo-due-date')?.textContent).toContain('2026-08-01');
  });

  it('highlights overdue todos', () => {
    const fixture = createComponent({ ...baseTodo, overdue: true });
    const el: HTMLElement = fixture.nativeElement;

    expect(el.querySelector('.todo-item')?.classList.contains('overdue')).toBe(true);
    expect(el.querySelector('.overdue-badge')).toBeTruthy();
  });

  it('emits toggle with the todo id when the checkbox changes', () => {
    const fixture = createComponent();
    const emitted: string[] = [];
    fixture.componentInstance.toggle.subscribe((id) => emitted.push(id));

    const checkbox = fixture.nativeElement.querySelector('input[type="checkbox"]') as HTMLInputElement;
    checkbox.dispatchEvent(new Event('change'));

    expect(emitted).toEqual(['1']);
  });

  it('requires a confirmation step before emitting delete', () => {
    const fixture = createComponent();
    const emitted: string[] = [];
    fixture.componentInstance.delete.subscribe((id) => emitted.push(id));
    const el: HTMLElement = fixture.nativeElement;

    const deleteButton = Array.from(el.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === 'Eliminar'
    ) as HTMLButtonElement;
    deleteButton.click();
    fixture.detectChanges();

    expect(emitted).toEqual([]);
    expect(el.querySelector('.confirm-delete')).toBeTruthy();

    const confirmButton = Array.from(el.querySelectorAll('.confirm-delete button')).find(
      (b) => b.textContent?.trim() === 'Sí'
    ) as HTMLButtonElement;
    confirmButton.click();

    expect(emitted).toEqual(['1']);
  });

  it('cancelling delete confirmation does not emit delete', () => {
    const fixture = createComponent();
    const emitted: string[] = [];
    fixture.componentInstance.delete.subscribe((id) => emitted.push(id));
    const el: HTMLElement = fixture.nativeElement;

    const deleteButton = Array.from(el.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === 'Eliminar'
    ) as HTMLButtonElement;
    deleteButton.click();
    fixture.detectChanges();

    const cancelButton = Array.from(el.querySelectorAll('.confirm-delete button')).find(
      (b) => b.textContent?.trim() === 'No'
    ) as HTMLButtonElement;
    cancelButton.click();
    fixture.detectChanges();

    expect(emitted).toEqual([]);
    expect(el.querySelector('.confirm-delete')).toBeFalsy();
  });

  it('emits saveEdit with updated fields when the edit form is submitted', async () => {
    const fixture = createComponent();
    const emitted: { id: string; dto: unknown }[] = [];
    fixture.componentInstance.saveEdit.subscribe((payload) => emitted.push(payload));
    const el: HTMLElement = fixture.nativeElement;

    const editButton = Array.from(el.querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === 'Editar'
    ) as HTMLButtonElement;
    editButton.click();
    fixture.detectChanges();
    // NgForm registers its NgModel controls (and wires up the value accessor)
    // inside a microtask, so the test must let that microtask flush before
    // simulating input on the freshly-created form controls.
    await fixture.whenStable();

    const titleInput = el.querySelector('input[name="editTitle"]') as HTMLInputElement;
    titleInput.value = 'Buy oat milk';
    titleInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const form = el.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(emitted).toEqual([
      { id: '1', dto: { title: 'Buy oat milk', description: 'Whole milk', dueDate: '2026-08-01' } }
    ]);
  });
});
