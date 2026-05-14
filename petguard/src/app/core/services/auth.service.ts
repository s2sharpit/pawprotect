import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { Router } from '@angular/router';
import { API_ENDPOINTS } from '@core/constants/api.endpoints';
import { AuthStore } from '@core/store/auth.store';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private authStore = inject(AuthStore);
  private platformId = inject(PLATFORM_ID);

  getMe(): Observable<any> {
    if (!isPlatformBrowser(this.platformId)) {
      return of(null);
    }
    return this.http.get(API_ENDPOINTS.AUTH.ME).pipe(
      tap({
        next: (response: any) => {
          this.authStore.loginSuccess(response);
        },
        error: () => {
          this.authStore.logout();
        }
      }),
      catchError(() => of(null))
    );
  }

  register(userData: any): Observable<any> {
    this.authStore.setLoading(true);
    return this.http.post(API_ENDPOINTS.AUTH.REGISTER, userData).pipe(
      tap({
        next: (response: any) => {
          this.authStore.loginSuccess(response);
        },
        error: (err) => {
          this.authStore.setError(err.message || 'Registration failed');
        }
      })
    );
  }

  login(email: string, password: string): Observable<any> {
    this.authStore.setLoading(true);
    return this.http.post(API_ENDPOINTS.AUTH.LOGIN, { email, password }).pipe(
      tap({
        next: (response: any) => {
          this.authStore.loginSuccess(response);
        },
        error: (err) => {
          this.authStore.setError(err.message || 'Login failed');
        }
      })
    );
  }

  logout(): void {
    this.http.post(API_ENDPOINTS.AUTH.LOGOUT, {}).subscribe({
      next: () => {
        this.authStore.logout();
        this.router.navigate(['/login']);
      },
      error: () => {
        this.authStore.logout();
        this.router.navigate(['/login']);
      }
    });
  }

  isAuthenticated(): boolean {
    return this.authStore.isAuthenticated();
  }

  isAdmin(): boolean {
    return this.authStore.isAdmin();
  }
}
