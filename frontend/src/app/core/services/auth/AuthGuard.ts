import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService, PerfilAcesso } from './AuthService';

/** Exige sessão; manda para o login guardando a página pedida para voltar depois. */
export const authGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

/** Exige ao menos um dos papéis informados; visitantes vão para o login e usuários sem permissão voltam para a conta. */
export function roleGuard(...papeisPermitidos: PerfilAcesso[]): CanActivateFn {
  return (_route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
      return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
    }
    if (papeisPermitidos.some((papel) => authService.possuiPapel(papel))) {
      return true;
    }
    return router.createUrlTree(['/minha-conta']);
  };
}

/** Exige perfil ADMIN; clientes autenticados voltam para a própria conta. */
export const adminGuard: CanActivateFn = roleGuard('ADMIN');
