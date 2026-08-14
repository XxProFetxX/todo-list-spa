import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../environments/environment';
import { Todo } from './todo.model';
import { TodoService } from './todo.service';

describe('TodoService', () => {
  let service: TodoService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/todos`;

  const sampleTodo: Todo = {
    id: '1',
    title: 'Buy milk',
    completed: false,
    createdAt: '2026-08-01T00:00:00.000Z',
    overdue: false
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(TodoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('getTodos() without a filter hits GET /todos with no overdue param', () => {
    service.getTodos().subscribe((todos) => {
      expect(todos).toEqual([sampleTodo]);
    });

    const req = httpMock.expectOne((r) => r.url === baseUrl);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.has('overdue')).toBe(false);
    req.flush([sampleTodo]);
  });

  it('getTodos(true) hits GET /todos?overdue=true', () => {
    service.getTodos(true).subscribe();

    const req = httpMock.expectOne(`${baseUrl}?overdue=true`);
    expect(req.request.method).toBe('GET');
    req.flush([sampleTodo]);
  });

  it('getTodos(false) hits GET /todos?overdue=false', () => {
    service.getTodos(false).subscribe();

    const req = httpMock.expectOne(`${baseUrl}?overdue=false`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('getTodo(id) hits GET /todos/:id', () => {
    service.getTodo('1').subscribe((todo) => {
      expect(todo).toEqual(sampleTodo);
    });

    const req = httpMock.expectOne(`${baseUrl}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(sampleTodo);
  });

  it('createTodo(dto) hits POST /todos with the dto as body', () => {
    const dto = { title: 'Buy milk', description: 'Whole milk', dueDate: '2026-08-20' };

    service.createTodo(dto).subscribe((todo) => {
      expect(todo).toEqual(sampleTodo);
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);
    req.flush(sampleTodo);
  });

  it('updateTodo(id, dto) hits PATCH /todos/:id with the partial dto', () => {
    const dto = { title: 'Buy oat milk' };

    service.updateTodo('1', dto).subscribe((todo) => {
      expect(todo).toEqual({ ...sampleTodo, title: 'Buy oat milk' });
    });

    const req = httpMock.expectOne(`${baseUrl}/1`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(dto);
    req.flush({ ...sampleTodo, title: 'Buy oat milk' });
  });

  it('toggleTodo(id) hits PATCH /todos/:id/toggle', () => {
    service.toggleTodo('1').subscribe((todo) => {
      expect(todo).toEqual({ ...sampleTodo, completed: true });
    });

    const req = httpMock.expectOne(`${baseUrl}/1/toggle`);
    expect(req.request.method).toBe('PATCH');
    req.flush({ ...sampleTodo, completed: true });
  });

  it('deleteTodo(id) hits DELETE /todos/:id', () => {
    service.deleteTodo('1').subscribe();

    const req = httpMock.expectOne(`${baseUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
  });
});
