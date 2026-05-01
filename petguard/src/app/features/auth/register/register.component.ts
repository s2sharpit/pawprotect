
import { Component } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { AuthService } from '@core/services/auth.service';
import { Router } from "@angular/router";

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-linear-to-br from-purple-600 to-pink-500 flex items-center justify-center p-6">
      <div class="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md animate-slide-up">
        <!-- Logo -->
        <div class="text-center mb-8">
          <div class="text-6xl mb-4">🐾</div>
          <h2 class="text-3xl font-bold text-gray-800 mb-2">Join PawProtect</h2>
          <p class="text-gray-600">Create your account and start protecting your pets</p>
        </div>
    
        <!-- Error Message -->
        @if (errorMessage) {
          <div
            class="bg-red-50 border-2 border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4">
            {{ errorMessage }}
          </div>
        }
    
        <!-- Register Form -->
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <div class="space-y-4">
            <!-- Full Name -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                formControlName="fullName"
                class="input-field"
                placeholder="John Doe" />
              </div>
    
              <!-- Email -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  formControlName="email"
                  class="input-field"
                  placeholder="you@example.com" />
                </div>
    
                <!-- Phone -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    formControlName="phone"
                    class="input-field"
                    placeholder="+1 (555) 000-0000" />
                  </div>
    
                  <!-- Password -->
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                    <input
                      type="password"
                      formControlName="password"
                      class="input-field"
                      placeholder="••••••••" />
                      <p class="text-xs text-gray-500 mt-1">At least 6 characters</p>
                    </div>
    
                    <!-- Terms -->
                    <label class="flex items-start">
                      <input type="checkbox" formControlName="terms" class="mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-500">
                      <span class="ml-2 text-sm text-gray-600">
                        I agree to the <a href="#" class="text-purple-600 hover:text-purple-800">Terms of Service</a> and
                        <a href="#" class="text-purple-600 hover:text-purple-800">Privacy Policy</a>
                      </span>
                    </label>
    
                    <!-- Submit Button -->
                    <button
                      type="submit"
                      [disabled]="registerForm.invalid || isLoading"
                      class="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
                      @if (!isLoading) {
                        <span>Create Account</span>
                      }
                      @if (isLoading) {
                        <span>Creating...</span>
                      }
                    </button>
                  </div>
                </form>
    
                <!-- Login Link -->
                <div class="mt-6 text-center">
                  <p class="text-gray-600">
                    Already have an account?
                    <a (click)="navigateToLogin()" class="text-purple-600 hover:text-purple-800 font-semibold cursor-pointer">
                      Login
                    </a>
                  </p>
                </div>
              </div>
            </div>
    `
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      terms: [false, Validators.requiredTrue]
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      this.authService.register(this.registerForm.value).subscribe({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Registration failed';
        }
      });
    }
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}
