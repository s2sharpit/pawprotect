import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '@core/services/auth.service';
import { User } from '@core/models/models';
// import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-linear-to-br from-purple-600 to-pink-500 flex items-center justify-center p-6">
      <div class="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md animate-slide-up">
        <!-- Logo -->
        <div class="text-center mb-8">
          <div class="text-6xl mb-4">🐾</div>
          <h2 class="text-3xl font-bold text-gray-800 mb-2">Welcome Back!</h2>
          <p class="text-gray-600">Login to your PawProtect account</p>
        </div>

        <!-- Error Message -->
        @if (errorMessage()) {
          <div class="bg-red-50 border-2 border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4">
            {{ errorMessage() }}
          </div>
        }

        <!-- Login Form -->
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="space-y-4">
            <!-- Email -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input
                type="email"
                formControlName="email"
                class="input-field"
                [class.border-red-500]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
                placeholder="you@example.com" />
              @if (loginForm.get('email')?.invalid && loginForm.get('email')?.touched) {
                <p class="text-red-500 text-sm mt-1">
                  Please enter a valid email
                </p>
              }
            </div>

            <!-- Password -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <input
                type="password"
                formControlName="password"
                class="input-field"
                [class.border-red-500]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
                placeholder="••••••••" />
              @if (loginForm.get('password')?.invalid && loginForm.get('password')?.touched) {
                <p class="text-red-500 text-sm mt-1">
                  Password is required
                </p>
              }
            </div>

            <!-- Remember Me & Forgot Password -->
            <div class="flex items-center justify-between">
              <label class="flex items-center">
                <input type="checkbox" class="rounded border-gray-300 text-purple-600 focus:ring-purple-500">
                <span class="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <a href="#" class="text-sm text-purple-600 hover:text-purple-800">Forgot password?</a>
            </div>

            <!-- Submit Button -->
              <button
                type="submit"
                [disabled]="loginForm.invalid || isLoading()"
                class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
                @if (!isLoading()) {
                  <span>Login</span>
                }
                @if (isLoading()) {
                  <span class="flex items-center justify-center">
                    <svg class="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging in...
                  </span>
                }
              </button>
            </div>
          </div>
        </form>

        <!-- Sign Up Link -->
        <div class="mt-6 text-center">
          <p class="text-gray-600">
            Don't have an account?
            <a (click)="navigateToRegister()" class="text-purple-600 hover:text-purple-800 font-semibold cursor-pointer">
              Sign up
            </a>
          </p>
        </div>

        <!-- Back to Home -->
        <div class="mt-4 text-center">
          <a (click)="navigateToHome()" class="text-sm text-gray-500 hover:text-gray-700 cursor-pointer">
            ← Back to home
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes slide-up {
      from { opacity: 0; transform: translateY(50px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .animate-slide-up {
      animation: slide-up 0.5s ease-out;
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = signal(false);
  errorMessage = signal('');

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set('');

      const { email, password } = this.loginForm.value;

      this.authService.login(email, password).subscribe({
        next: (response: User) => {
          this.isLoading.set(false);

          if (response.role === 'ADMIN') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/dashboard']);
          }
        },
        error: (error) => {
          this.isLoading.set(false);
          this.errorMessage.set(error.error?.message || 'Invalid email or password');
        }
      });
    }
  }

  navigateToRegister() {
    this.router.navigate(['/register']);
  }

  navigateToHome() {
    this.router.navigate(['/']);
  }
}
