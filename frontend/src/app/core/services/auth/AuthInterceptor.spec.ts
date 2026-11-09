import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { authInterceptor } from './AuthInterceptor';

describe('authInterceptor', () => {
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
    localStorage.clear();
  });

  it('does not send a stored token to the public ecommerce catalog', () => {
    localStorage.setItem('token', 'expired-or-invalid-token');

    TestBed.inject(HttpClient)
      .get('http://localhost:8080/drones', { params: { page: 0, pageSize: 12 } })
      .subscribe();

    const request = httpTestingController.expectOne('http://localhost:8080/drones?page=0&pageSize=12');
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush({ items: [], page: 0, pageSize: 12, totalItems: 0, totalPages: 0 });
  });

  it('keeps sending the token to protected admin endpoints', () => {
    localStorage.setItem('token', 'admin-token');

    TestBed.inject(HttpClient).get('http://localhost:8080/drones/admin').subscribe();

    const request = httpTestingController.expectOne('http://localhost:8080/drones/admin');
    expect(request.request.headers.get('Authorization')).toBe('Bearer admin-token');
    request.flush({ items: [], page: 0, pageSize: 10, totalItems: 0, totalPages: 0 });
  });
});
