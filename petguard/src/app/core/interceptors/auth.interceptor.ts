import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID, REQUEST } from '@angular/core';
import { isPlatformServer } from '@angular/common';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  
  let modifiedReq = req;

  if (isPlatformServer(platformId)) {
    const serverRequest = inject(REQUEST, { optional: true }) as any;
    
    if (serverRequest) {
      // 1. Forward Cookies from the browser request to the backend call
      const cookie = serverRequest.headers?.['cookie'] || 
                     (serverRequest.headers?.get && serverRequest.headers.get('cookie'));
      
      if (cookie) {
        modifiedReq = modifiedReq.clone({
          setHeaders: { Cookie: cookie }
        });
      }
    }

    // 2. Handle Relative URLs
    // HttpClient on Node.js requires absolute URLs. We prepend the current host or internal backend URL.
    if (modifiedReq.url.startsWith('/')) {
      let baseUrl = '';
      const processEnv = typeof process !== 'undefined' ? process.env : undefined;
      
      if (processEnv && processEnv['BACKEND_URL']) {
        // Use internal backend URL (e.g. inside Docker)
        baseUrl = processEnv['BACKEND_URL'];
      } else {
        // Fallback to the host that the SSR server was accessed with
        const protocol = serverRequest?.protocol || 'http';
        const host = serverRequest?.get?.('host') || serverRequest?.headers?.['host'] || 'localhost:4000';
        baseUrl = `${protocol}://${host}`;
      }
      
      modifiedReq = modifiedReq.clone({
        url: `${baseUrl}${modifiedReq.url}`
      });
    }
  }

  // Ensure withCredentials is true for all requests (important for both browser and server)
  const finalReq = modifiedReq.clone({
    withCredentials: true
  });
  
  return next(finalReq);
};
