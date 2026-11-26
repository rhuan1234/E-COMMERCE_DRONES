import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AuthService } from './AuthService';

function jwtOidc(claims: Record<string, unknown>): string {
  const base64 = (valor: object) => btoa(JSON.stringify(valor)).replace(/=+$/, '');
  return `${base64({ alg: 'RS256' })}.${base64(claims)}.assinatura`;
}

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  const futuro = Math.floor(Date.now() / 1000) + 3600;

  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('authenticates via backend Quarkus and decodes Keycloak OIDC claims', () => {
    const token = jwtOidc({
      sub: 'kc-1',
      preferred_username: 'rhuan',
      email: 'rhuan@example.com',
      realm_access: { roles: ['ADMIN'] },
      exp: futuro,
    });

    service.login({ login: 'rhuan', senha: '123456' }).subscribe((res) => {
      expect(res.token).toBe(token);
    });

    const req = httpMock.expectOne('http://localhost:8080/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.url).not.toContain('8180');
    req.flush({
      token,
      tipo: 'Bearer',
      refreshToken: 'rt-1',
      expiresIn: 1800,
      usuario: {
        id: 1,
        keycloakId: 'kc-1',
        login: 'rhuan',
        email: 'rhuan@example.com',
        nomeCompleto: 'Rhuan Administrador',
        perfil: 'ADMIN',
        roles: ['ADMIN'],
      },
    });

    expect(service.isAuthenticated()).toBe(true);
    expect(service.isAdmin()).toBe(true);
    expect(service.possuiPapel('ADMIN')).toBe(true);
    expect(service.usuario()).toBe('rhuan');
    expect(localStorage.getItem('token')).toBe(token);
    expect(localStorage.getItem('refreshToken')).toBe('rt-1');
  });

  it('loads current user from /auth/me and clears session on 401', () => {
    localStorage.setItem('token', jwtOidc({ preferred_username: 'cliente', realm_access: { roles: ['CLIENTE'] }, exp: futuro }));
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

    service.carregarUsuarioAutenticado().subscribe((user) => {
      expect(user?.login).toBe('cliente');
    });

    const okReq = httpMock.expectOne('http://localhost:8080/auth/me');
    okReq.flush({
      id: 2,
      keycloakId: 'kc-2',
      login: 'cliente',
      email: 'cliente@example.com',
      nomeCompleto: 'Lucas Silva',
      perfil: 'CLIENTE',
      roles: ['CLIENTE'],
    });
    expect(service.emailUsuario()).toBe('cliente@example.com');

    service.carregarUsuarioAutenticado().subscribe((user) => {
      expect(user).toBeNull();
    });
    const failReq = httpMock.expectOne('http://localhost:8080/auth/me');
    failReq.flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(service.isAuthenticated()).toBe(false);
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('refreshes tokens via backend and notifies backend on logout', () => {
    localStorage.setItem('token', jwtOidc({ preferred_username: 'cliente', realm_access: { roles: ['CLIENTE'] }, exp: futuro }));
    localStorage.setItem('refreshToken', 'rt-antigo');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

    const novoToken = jwtOidc({ preferred_username: 'cliente', realm_access: { roles: ['CLIENTE'] }, exp: futuro + 600 });
    service.renovarSessao().subscribe((res) => {
      expect(res.token).toBe(novoToken);
    });

    const refreshReq = httpMock.expectOne('http://localhost:8080/auth/refresh');
    expect(refreshReq.request.body).toEqual({ refreshToken: 'rt-antigo' });
    refreshReq.flush({ token: novoToken, refreshToken: 'rt-novo' });

    expect(service.getRefreshToken()).toBe('rt-novo');

    service.logout();
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
    expect(service.isAuthenticated()).toBe(false);

    const logoutReq = httpMock.expectOne('http://localhost:8080/auth/logout');
    expect(logoutReq.request.method).toBe('POST');
    expect(logoutReq.request.body).toEqual({ refreshToken: 'rt-novo' });
    expect(logoutReq.request.headers.get('Authorization')).toBe(`Bearer ${novoToken}`);
    logoutReq.flush(null, { status: 204, statusText: 'No Content' });
  });
});
