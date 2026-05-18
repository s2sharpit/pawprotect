import { Component, inject } from '@angular/core';

import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@core/services/auth.service';
import { AuthStore } from '@core/store/auth.store';
import { ChatbotComponent } from './chatbot.component';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [RouterModule, FormsModule, ChatbotComponent],
  template: `
    <div class="flex h-screen bg-gray-50 overflow-hidden">

      <!-- Mobile Backdrop -->
      @if (sidebarOpen) {
        <div
          class="fixed inset-0 bg-black/40 z-30 md:hidden"
          (click)="sidebarOpen = false">
        </div>
      }

      <!-- Sidebar -->
      <aside
        class="fixed inset-y-0 left-0 z-40 w-64 bg-linear-to-b from-purple-600 to-pink-500 text-white flex flex-col transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:shrink-0"
        [class.-translate-x-full]="!sidebarOpen"
        [class.translate-x-0]="sidebarOpen">

        <div class="p-6 flex-1 overflow-y-auto">
          <div class="flex items-center space-x-2 mb-8">
            <span class="text-3xl">🐾</span>
            <span class="text-xl font-bold">PawProtect</span>
          </div>

          <!-- Navigation -->
          <nav class="space-y-2">
            @for (item of menuItems; track item) {
              <a
                [routerLink]="item.path"
                routerLinkActive="bg-white/20"
                (click)="sidebarOpen = false"
                class="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-white/10 transition cursor-pointer"
                >
                <span class="text-xl">{{ item.icon }}</span>
                <span class="font-medium">{{ item.label }}</span>
              </a>
            }
          </nav>
        </div>

        <!-- User Profile -->
        <div class="w-full p-6 border-t border-white/20">
          <div class="flex items-center space-x-3 mb-4">
            <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <span class="text-lg">👤</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-sm truncate">{{ authStore.user()?.fullName || 'User' }}</p>
              <p class="text-xs text-white/70 truncate">{{ authStore.user()?.email }}</p>
            </div>
          </div>
          <button
            (click)="logout()"
            class="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition"
            >
            <span>🚪</span>
            <span class="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 overflow-y-auto min-w-0">
        <!-- Top Bar -->
        <header class="bg-white border-b border-gray-200 px-4 md:px-8 py-4 sticky top-0 z-20">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <!-- Hamburger (mobile only) -->
              <button
                class="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
                (click)="sidebarOpen = !sidebarOpen"
                aria-label="Toggle sidebar">
                <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                </svg>
              </button>
              <h1 class="text-xl md:text-2xl font-bold text-gray-800">{{ getPageTitle() }}</h1>
            </div>

            <div class="flex items-center space-x-4">
              <!-- Notifications -->
              <button class="relative p-2 hover:bg-gray-100 rounded-lg transition">
                <span class="text-xl">🔔</span>
                <span class="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </header>

        <!-- Content Area -->
        <div class="p-4 md:p-8">
          <router-outlet></router-outlet>
        </div>
      </main>

      <!-- AI Chatbot Button -->
      <button
        (click)="toggleChatbot()"
        class="fixed bottom-6 right-6 w-14 h-14 md:w-16 md:h-16 bg-linear-to-r from-purple-500 to-pink-500 rounded-full shadow-2xl hover:scale-110 transition-transform z-50 flex items-center justify-center"
        >
        <span class="text-2xl md:text-3xl">💬</span>
      </button>

      <!-- Chatbot Modal as separate component -->
      @if (chatbotOpen) {
        <app-chatbot (close)="toggleChatbot()"></app-chatbot>
      }
    </div>
    `,
  styles: [
    `
      @keyframes slide-up {
        from {
          opacity: 0;
          transform: translateY(50px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .animate-slide-up {
        animation: slide-up 0.3s ease-out;
      }
    `,
  ],
})
export class DashboardLayoutComponent {
  menuItems = [
    { path: '/dashboard', icon: '🏠', label: 'Dashboard' },
    { path: '/dashboard/pets', icon: '🐕', label: 'My Pets' },
    { path: '/dashboard/plans', icon: '📋', label: 'Browse Plans' },
    { path: '/dashboard/policies', icon: '🛡️', label: 'My Policies' },
    { path: '/dashboard/claims', icon: '📄', label: 'My Claims' },
  ];

  currentUser: any = null;
  chatbotOpen = false;
  sidebarOpen = false;

  public authStore = inject(AuthStore);

  constructor(private authService: AuthService, private router: Router) {
  }

  getPageTitle(): string {
    const path = this.router.url;
    if (path.includes('/pets')) return 'My Pets';
    if (path.includes('/plans')) return 'Insurance Plans';
    if (path.includes('/policies')) return 'My Policies';
    if (path.includes('/claims')) return 'Claims';
    return 'Dashboard';
  }

  toggleChatbot() {
    this.chatbotOpen = !this.chatbotOpen;
  }

  logout() {
    this.authService.logout();
  }
}
