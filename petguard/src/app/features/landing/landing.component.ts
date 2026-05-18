import { Component } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [],
  template: `
    <div class="min-h-screen bg-linear-to-br from-purple-600 via-pink-500 to-orange-400">
      <!-- Navbar -->
      <nav class="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div class="container mx-auto px-6 py-4 flex items-center justify-between">
          <div class="flex items-center space-x-2 cursor-pointer">
            <span class="text-4xl">🐾</span>
            <span class="text-2xl font-bold text-white">PawProtect</span>
          </div>

          <!-- Desktop Nav -->
          <div class="hidden sm:flex items-center space-x-4">
            <button (click)="navigateToLogin()"
              class="text-white hover:text-white/80 font-semibold transition">
              Login
            </button>
            <button (click)="navigateToRegister()"
              class="bg-white text-purple-600 px-6 py-2 rounded-full font-bold hover:scale-105 transform transition shadow-lg">
              Get Started
            </button>
          </div>

          <!-- Mobile Hamburger -->
          <button
            class="sm:hidden p-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
            (click)="mobileMenuOpen = !mobileMenuOpen"
            aria-label="Toggle menu">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              @if (mobileMenuOpen) {
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              } @else {
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
              }
            </svg>
          </button>
        </div>

        <!-- Mobile Menu Dropdown -->
        @if (mobileMenuOpen) {
          <div class="sm:hidden bg-white/10 backdrop-blur-md border-t border-white/20 px-6 py-4 flex flex-col space-y-3">
            <button (click)="navigateToLogin(); mobileMenuOpen = false"
              class="text-white font-semibold text-left py-2 hover:text-white/80 transition">
              Login
            </button>
            <button (click)="navigateToRegister(); mobileMenuOpen = false"
              class="bg-white text-purple-600 px-6 py-2 rounded-full font-bold text-center hover:scale-105 transform transition shadow-lg">
              Get Started
            </button>
          </div>
        }
      </nav>
    
      <!-- Hero Section -->
      <div class="container mx-auto px-6 py-12 md:py-20 text-center">
        <div class="animate-fade-in">
          <h1 class="text-4xl sm:text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Protect Your<br />Furry Friends 🐾
          </h1>
          <p class="text-lg md:text-xl text-white/90 mb-10 md:mb-12 max-w-2xl mx-auto">
            AI-powered pet insurance made simple. Get instant eligibility checks and claim approvals.
          </p>
          <div class="flex flex-col sm:flex-row justify-center gap-4">
            <button (click)="navigateToRegister()"
              class="bg-white text-purple-600 px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transform transition shadow-2xl">
              Start Free Trial
            </button>
            <button class="bg-white/20 backdrop-blur text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/30 transition border-2 border-white">
              Learn More
            </button>
          </div>
        </div>
    
        <!-- Features Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          @for (feature of features; track feature) {
            <div
              class="bg-white/10 backdrop-blur-md rounded-2xl p-8 hover:bg-white/20 transition-all duration-300 border border-white/20 hover:scale-105 transform">
              <div class="text-5xl mb-4">{{ feature.icon }}</div>
              <h3 class="text-2xl font-bold text-white mb-2">{{ feature.title }}</h3>
              <p class="text-white/80">{{ feature.description }}</p>
            </div>
          }
        </div>
    
        <!-- Stats Section -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20">
          @for (stat of stats; track stat) {
            <div
              class="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <div class="text-4xl font-bold text-white mb-2">{{ stat.value }}</div>
              <div class="text-white/80">{{ stat.label }}</div>
            </div>
          }
        </div>
      </div>
    
      <!-- How It Works Section -->
      <div class="bg-white/10 backdrop-blur-md py-20 mt-20">
        <div class="container mx-auto px-6">
          <h2 class="text-4xl font-bold text-white text-center mb-16">How It Works</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            @for (step of steps; track step; let i = $index) {
              <div
                class="text-center">
                <div class="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-purple-600">
                  {{ i + 1 }}
                </div>
                <h3 class="text-xl font-bold text-white mb-2">{{ step.title }}</h3>
                <p class="text-white/80">{{ step.description }}</p>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
    `,
  styles: [`
    @keyframes fade-in {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .animate-fade-in {
      animation: fade-in 0.8s ease-out;
    }
  `]
})
export class LandingComponent {
  features = [
    { icon: '🤖', title: 'AI-Powered', description: 'Instant eligibility checks using advanced AI' },
    { icon: '⚡', title: 'Fast Claims', description: 'Get approved in minutes, not days' },
    { icon: '💬', title: 'Health Chatbot', description: '24/7 AI health assistant for your pets' }
  ];

  stats = [
    { value: '50K+', label: 'Happy Pets' },
    { value: '98%', label: 'Approval Rate' },
    { value: '24/7', label: 'Support' },
    { value: '$2M+', label: 'Claims Paid' }
  ];

  steps = [
    { title: 'Sign Up', description: 'Create your free account' },
    { title: 'Add Pets', description: 'Upload pet medical records' },
    { title: 'Choose Plan', description: 'Select the perfect coverage' },
    { title: 'Get Protected', description: 'Submit claims anytime' }
  ];

  mobileMenuOpen = false;

  constructor(private router: Router) {}

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  navigateToRegister() {
    this.router.navigate(['/register']);
  }
}
