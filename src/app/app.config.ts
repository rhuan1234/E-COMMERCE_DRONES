import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/services/auth/AuthInterceptor';

import { MatPaginatorIntl } from '@angular/material/paginator';
import { getCustomPaginatorIntl } from './shared/custom-paginator-intl';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes), 
    provideClientHydration(),
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    { provide: MatPaginatorIntl, useFactory: getCustomPaginatorIntl }
  ]
};
