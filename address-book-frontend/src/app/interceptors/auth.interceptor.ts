import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const token = localStorage.getItem('token');
  
  // Check if URL is internal:
  // 1. Starts with /api (relative)
  // 2. Starts with the configured environment.apiUrl
  const isApiUrl = req.url.startsWith('/api') || req.url.startsWith(environment.apiUrl);

  if (token && isApiUrl) {

    const cloned = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });

    return next(cloned);
  }

  return next(req);
};