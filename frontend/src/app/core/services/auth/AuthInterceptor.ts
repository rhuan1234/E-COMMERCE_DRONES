import { HttpContextToken, HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from './AuthService';

const TENTATIVA_APOS_REFRESH = new HttpContextToken<boolean>(() => false);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router, { optional: true });

  if (
    isEndpointPublicoAuth(req)
    || req.url.includes('viacep.com.br')
    || isPublicReadRequest(req)
  ) {
    return next(req);
  }

  const token = authService.getToken() ?? lerTokenLocal();
  const requisicao = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(requisicao).pipe(
    catchError((erro: unknown) => {
      if (!(erro instanceof HttpErrorResponse)) {
        return throwError(() => erro);
      }

      if (erro.status === 401 && !isEndpointAuthSemRefresh(req.url)) {
        const jaTentouRefresh = req.context.get(TENTATIVA_APOS_REFRESH);
        if (!jaTentouRefresh && authService.getRefreshToken()) {
          return authService.renovarSessao().pipe(
            switchMap((resposta) => {
              const requisicaoRenovada = req.clone({
                context: req.context.set(TENTATIVA_APOS_REFRESH, true),
                setHeaders: { Authorization: `Bearer ${resposta.token}` },
              });
              return next(requisicaoRenovada);
            }),
            catchError((erroRefresh) => {
              encerrarSessaoERedirecionar(authService, router);
              return throwError(() => erroRefresh);
            }),
          );
        }

        if (token) {
          encerrarSessaoERedirecionar(authService, router);
        }
      }

      if (erro.status === 403 && router?.url.startsWith('/admin') && !authService.isAdmin()) {
        void router.navigate(['/minha-conta']);
      }

      return throwError(() => erro);
    }),
  );
};

function encerrarSessaoERedirecionar(authService: AuthService, router: Router | null): void {
  authService.limparSessaoLocal();
  if (!router) {
    return;
  }
  const urlAtual = router.url || '/';
  if (urlAtual.startsWith('/login') || urlAtual.startsWith('/register')) {
    return;
  }
  void router.navigate(
    ['/login'],
    urlAtual !== '/' ? { queryParams: { returnUrl: urlAtual } } : undefined,
  );
}

function isEndpointAuthSemRefresh(url: string): boolean {
  const path = extrairPath(url);
  return path === '/auth/login' || path === '/auth/refresh' || path === '/auth/logout';
}

function isEndpointPublicoAuth(req: HttpRequest<unknown>): boolean {
  const path = extrairPath(req.url);
  if (isEndpointAuthSemRefresh(req.url)) {
    return true;
  }
  if (req.method === 'POST' && (path === '/clientes' || path === '/clientes/esqueci-senha' || path === '/clientes/resetar-senha')) {
    return true;
  }
  return false;
}

function isPublicReadRequest(req: HttpRequest<unknown>): boolean {
  if (req.method !== 'GET') {
    return false;
  }

  const path = extrairPath(req.url);
  return path === '/drones'
    || /^\/drones\/(?:\d+|imagens\/\d+\/arquivo|nome\/[^/]+|marcas\/[^/]+|modelos\/[^/]+|preco\/?)$/.test(path)
    || /^\/avaliacoes\/drone\/\d+$/.test(path)
    || /^\/avaliacoes\/\d+$/.test(path);
}

function extrairPath(url: string): string {
  return new URL(url, 'http://localhost').pathname;
}

function lerTokenLocal(): string | null {
  try {
    return localStorage.getItem('token');
  } catch {
    return null;
  }
}
