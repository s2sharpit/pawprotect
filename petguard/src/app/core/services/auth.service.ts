import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
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

  constructor() {
    this.authStore.loadFromStorage();
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
    this.authStore.logout();
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return this.authStore.isAuthenticated();
  }

  isAdmin(): boolean {
    return this.authStore.isAdmin();
  }
}
