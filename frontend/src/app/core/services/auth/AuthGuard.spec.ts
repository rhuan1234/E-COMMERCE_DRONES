import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { adminGuard, authGuard } from './AuthGuard';
import { AuthService } from './AuthService';

/** JWT sem assinatura válida: o frontend só lê o payload para decidir a navegação. */
function token(claims: Record<string, unknown>): string {
  const base64 = (valor: object) => btoa(JSON.stringify(valor)).replace(/=+$/, '');
  return `${base64({ alg: 'none' })}.${base64(claims)}.assinatura`;
}

const futuro = Math.floor(Date.now() / 1000) + 3600;

describe('AuthGuard', () => {
  const estado = (url: string) => ({ url }) as RouterStateSnapshot;
  const rota = {} as ActivatedRouteSnapshot;

  function executar(guard: typeof authGuard, url: string): boolean | UrlTree {
    return TestBed.runInInjectionContext(() => guard(rota, estado(url))) as boolean | UrlTree;
  }

  function iniciarCom(jwt: string | null): void {
    localStorage.clear();
    if (jwt) {
      localStorage.setItem('token', jwt);
    }
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [provideRouter([]), provideHttpClient()] });
  }

  afterEach(() => localStorage.clear());

  it('sends visitors to login keeping the requested page', () => {
    iniciarCom(null);
    const resultado = executar(authGuard, '/minha-conta/enderecos');

    expect(TestBed.inject(Router).serializeUrl(resultado as UrlTree))
      .toBe('/login?returnUrl=%2Fminha-conta%2Fenderecos');
  });

  it('lets any authenticated user into the account area', () => {
    iniciarCom(token({ upn: 'cliente', groups: ['CLIENTE'], exp: futuro }));
    expect(executar(authGuard, '/minha-conta')).toBe(true);
  });

  it('keeps customers out of the admin panel', () => {
    iniciarCom(token({ upn: 'cliente', groups: ['CLIENTE'], exp: futuro }));
    const resultado = executar(adminGuard, '/admin/drones');

    expect(TestBed.inject(Router).serializeUrl(resultado as UrlTree)).toBe('/minha-conta');
  });

  it('lets administrators into the admin panel', () => {
    iniciarCom(token({ upn: 'admin', groups: ['ADMIN'], exp: futuro }));

    expect(executar(adminGuard, '/admin/drones')).toBe(true);
    expect(TestBed.inject(AuthService).destinoPadrao()).toBe('/admin');
    expect(TestBed.inject(AuthService).usuario()).toBe('admin');
  });

  it('treats an expired token as a visitor', () => {
    iniciarCom(token({ upn: 'admin', groups: ['ADMIN'], exp: Math.floor(Date.now() / 1000) - 10 }));
    const resultado = executar(adminGuard, '/admin');

    expect(TestBed.inject(Router).serializeUrl(resultado as UrlTree)).toBe('/login?returnUrl=%2Fadmin');
  });
});
