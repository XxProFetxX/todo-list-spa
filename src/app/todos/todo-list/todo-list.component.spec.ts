import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { Todo } from '../todo.model';
import { TodoListComponent } from './todo-list.component';

describe('TodoListComponent', () => {
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/todos`;

  const todoA: Todo = {
    id: '1',
    title: 'Buy milk',
    completed: false,
    createdAt: '2026-08-01T00:00:00.000Z',
    overdue: false
  };
  const todoB: Todo = {
    id: '2',
    title: 'Pay rent',
    completed: false,
    createdAt: '2026-07-01T00:00:00.000Z',
    dueDate: '2026-07-15',
    overdue: true
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TodoListComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  function createComponent() {
    const fixture = TestBed.createComponent(TodoListComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('loads todos with GET /todos on init and renders them', () => {
    const fixture = createComponent();

    const req = httpMock.expectOne((r) => r.url === baseUrl);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.has('overdue')).toBe(false);
    req.flush([todoA, todoB]);
    fixture.detectChanges();

    expect(fixture.componentInstance['todos']()).toEqual([todoA, todoB]);
    const items = fixture.nativeElement.querySelectorAll('app-todo-item');
    expect(items.length).toBe(2);
  });

  it('re-fetches with overdue=true when the overdue toggle is switched on', () => {
    const fixture = createComponent();
    httpMock.expectOne((r) => r.url === baseUrl).flush([todoA, todoB]);
    fixture.detectChanges();

    fixture.componentInstance['toggleOverdueOnly']();

    const req = httpMock.expectOne(`${baseUrl}?overdue=true`);
    expect(req.request.method).toBe('GET');
    req.flush([todoB]);
    fixture.detectChanges();

    expect(fixture.componentInstance['todos']()).toEqual([todoB]);
  });

  it('appends a created todo to the list without refetching', () => {
    const fixture = createComponent();
    httpMock.expectOne((r) => r.url === baseUrl).flush([todoA]);
    fixture.detectChanges();

    fixture.componentInstance['onCreate']({ title: 'New task' });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    req.flush({ ...todoA, id: '3', title: 'New task' });
    fixture.detectChanges();

    expect(fixture.componentInstance['todos']().length).toBe(2);
  });

  it('updates the todo in place when toggled', () => {
    const fixture = createComponent();
    httpMock.expectOne((r) => r.url === baseUrl).flush([todoA]);
    fixture.detectChanges();

    fixture.componentInstance['onToggle']('1');

    const req = httpMock.expectOne(`${baseUrl}/1/toggle`);
    expect(req.request.method).toBe('PATCH');
    req.flush({ ...todoA, completed: true });
    fixture.detectChanges();

    expect(fixture.componentInstance['todos']()[0].completed).toBe(true);
  });

  it('removes the todo from the list after a successful delete', () => {
    const fixture = createComponent();
    httpMock.expectOne((r) => r.url === baseUrl).flush([todoA]);
    fixture.detectChanges();

    fixture.componentInstance['onDelete']('1');

    const req = httpMock.expectOne(`${baseUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
    fixture.detectChanges();

    expect(fixture.componentInstance['todos']()).toEqual([]);
  });

  it('shows a clean message and does not crash on a 404 error', () => {
    const fixture = createComponent();
    httpMock.expectOne((r) => r.url === baseUrl).flush([todoA]);
    fixture.detectChanges();

    fixture.componentInstance['onDelete']('1');

    const req = httpMock.expectOne(`${baseUrl}/1`);
    req.flush({ message: 'not found' }, { status: 404, statusText: 'Not Found' });
    fixture.detectChanges();

    expect(fixture.componentInstance['errorMessage']()).toBeTruthy();
    const banner = fixture.nativeElement.querySelector('.error-banner');
    expect(banner?.textContent).toContain('no existe');
  });

  it('shows a clean message on a 400 validation error', () => {
    const fixture = createComponent();
    httpMock.expectOne((r) => r.url === baseUrl).flush([]);
    fixture.detectChanges();

    fixture.componentInstance['onCreate']({ title: '' } as never);

    const req = httpMock.expectOne(baseUrl);
    req.flush({ message: 'invalid' }, { status: 400, statusText: 'Bad Request' });
    fixture.detectChanges();

    expect(fixture.componentInstance['errorMessage']()).toContain('no son válidos');
  });
});
