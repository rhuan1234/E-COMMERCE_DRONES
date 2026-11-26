import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { authInterceptor } from './AuthInterceptor';

describe('authInterceptor', () => {
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
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

  it('does not attach Authorization on login or public registration endpoints', () => {
    localStorage.setItem('token', 'old-token');

    TestBed.inject(HttpClient).post('http://localhost:8080/auth/login', { login: 'a', senha: 'b' }).subscribe();
    const loginReq = httpTestingController.expectOne('http://localhost:8080/auth/login');
    expect(loginReq.request.headers.has('Authorization')).toBe(false);
    loginReq.flush({ token: 'new' });

    TestBed.inject(HttpClient).post('http://localhost:8080/clientes', { login: 'a', senha: 'b', email: 'a@b.com' }).subscribe();
    const regReq = httpTestingController.expectOne('http://localhost:8080/clientes');
    expect(regReq.request.headers.has('Authorization')).toBe(false);
    regReq.flush({});
  });

  it('refreshes the session and retries once when receiving 401 with a refreshToken', () => {
    localStorage.setItem('token', 'expired-token');
    localStorage.setItem('refreshToken', 'valid-refresh');

    let resposta: unknown;
    TestBed.inject(HttpClient)
      .get('http://localhost:8080/auth/me')
      .subscribe((res) => (resposta = res));

    const firstReq = httpTestingController.expectOne('http://localhost:8080/auth/me');
    expect(firstReq.request.headers.get('Authorization')).toBe('Bearer expired-token');
    firstReq.flush({}, { status: 401, statusText: 'Unauthorized' });

    const refreshReq = httpTestingController.expectOne('http://localhost:8080/auth/refresh');
    expect(refreshReq.request.body).toEqual({ refreshToken: 'valid-refresh' });
    refreshReq.flush({ token: 'fresh-token', refreshToken: 'fresh-refresh' });

    const retryReq = httpTestingController.expectOne('http://localhost:8080/auth/me');
    expect(retryReq.request.headers.get('Authorization')).toBe('Bearer fresh-token');
    retryReq.flush({ login: 'cliente' });

    expect(resposta).toEqual({ login: 'cliente' });
  });

  it('clears session and redirects to /login on 401 without refreshToken', () => {
    localStorage.setItem('token', 'expired-token');
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    let erroStatus = 0;
    TestBed.inject(HttpClient)
      .get('http://localhost:8080/clientes')
      .subscribe({ error: (err) => (erroStatus = err.status) });

    const req = httpTestingController.expectOne('http://localhost:8080/clientes');
    req.flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(erroStatus).toBe(401);
    expect(localStorage.getItem('token')).toBeNull();
    expect(navigate).toHaveBeenCalledWith(['/login'], undefined);
  });
});
