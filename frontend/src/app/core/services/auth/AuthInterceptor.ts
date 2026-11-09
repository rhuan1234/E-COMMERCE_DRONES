import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (
    req.url.includes('/auth/login')
    || req.url.includes('viacep.com.br')
    || isPublicDroneRequest(req)
  ) {
    return next(req);
  }

  const token = localStorage.getItem('token');
  if (!token) {
    return next(req);
  }

  return next(req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  }));
};

function isPublicDroneRequest(req: HttpRequest<unknown>): boolean {
  if (req.method !== 'GET') {
    return false;
  }

  const path = new URL(req.url, 'http://localhost').pathname;
  return path === '/drones'
    || /^\/drones\/(?:\d+|imagens\/\d+\/arquivo|nome\/[^/]+|marcas\/[^/]+|modelos\/[^/]+|preco\/?)$/.test(path);
}
