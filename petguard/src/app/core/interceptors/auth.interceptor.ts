import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Set withCredentials: true on all requests to ensure the browser sends the HttpOnly JWT cookie
  const cloned = req.clone({
    withCredentials: true
  });
  return next(cloned);
};
