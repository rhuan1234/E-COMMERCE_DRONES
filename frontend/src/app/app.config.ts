import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling, withViewTransitions } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/services/auth/AuthInterceptor';
import { AuthService } from './core/services/auth/AuthService';

import { MatPaginatorIntl } from '@angular/material/paginator';
import { getCustomPaginatorIntl } from './shared/custom-paginator-intl';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }),
      withViewTransitions({
        skipInitialTransition: true,
        onViewTransitionCreated({ transition }) {
          // Roteamento de foco acessível ao finalizar a transição de rota (same-document-transitions)
          void transition.finished.finally(() => {
            const main = document.getElementById('conteudo-loja');
            if (main && document.activeElement === document.body) {
              main.focus({ preventScroll: true });
            }
          });
        },
      }),
    ),
    provideClientHydration(),
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    provideAppInitializer(() => inject(AuthService).inicializarSessao()),
    { provide: MatPaginatorIntl, useFactory: getCustomPaginatorIntl }
  ]
};
