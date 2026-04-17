import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';  // ✅ ADD THIS
import { authInterceptor } from './interceptors/auth.interceptor' // ✅ ADD THIS

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideAnimations(),

    // ✅ REGISTER THE HTTP CLIENT WITH THE INTERCEPTOR
    provideHttpClient(
      withInterceptors([authInterceptor])
    ) // ✅ THIS IS THE FIX
  ]
};
