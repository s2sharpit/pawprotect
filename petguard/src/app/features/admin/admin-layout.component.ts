
import { Component, OnInit, inject, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Router, RouterModule } from "@angular/router";
import { API_ENDPOINTS } from "@core/constants/api.endpoints";

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterModule],
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
        class="fixed inset-y-0 left-0 z-40 w-64 bg-linear-to-b from-gray-900 to-gray-800 text-white flex flex-col transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:shrink-0"
        [class.-translate-x-full]="!sidebarOpen"
        [class.translate-x-0]="sidebarOpen">

        <div class="p-6 flex-1 overflow-y-auto">
          <div class="flex items-center space-x-2 mb-8">
            <span class="text-3xl">👨‍💼</span>
            <div>
              <span class="text-xl font-bold block">Admin Panel</span>
              <span class="text-xs text-gray-400">PawProtect</span>
            </div>
          </div>

          <!-- Navigation -->
          <nav class="space-y-2">
            @for (item of adminMenuItems; track item) {
              <a
                [routerLink]="item.path"
                routerLinkActive="bg-white/10"
                (click)="sidebarOpen = false"
                class="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-white/5 transition cursor-pointer">
                <span class="text-xl">{{ item.icon }}</span>
                <span class="font-medium">{{ item.label }}</span>
              </a>
            }
          </nav>
        </div>

        <!-- Admin Profile -->
        <div class="w-full p-6 border-t border-white/10">
          <div class="flex items-center space-x-3 mb-4">
            <div class="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
              <span class="text-lg">👨‍💼</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-sm truncate">Admin User</p>
              <p class="text-xs text-gray-400 truncate">admin&#64;pawprotect.com</p>
            </div>
          </div>
          <button (click)="logout()"
            class="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition">
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
              <button class="relative p-2 hover:bg-gray-100 rounded-lg transition">
                <span class="text-xl">🔔</span>
                <span class="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-bold">
                  3
                </span>
              </button>
            </div>
          </div>
        </header>

        <!-- Content Area -->
        <div class="p-4 md:p-8">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
    `
})
export class AdminLayoutComponent {
  adminMenuItems = [
    { path: '/admin', icon: '📊', label: 'Dashboard' },
    { path: '/admin/claims', icon: '📄', label: 'Review Claims' },
    { path: '/admin/plans', icon: '📋', label: 'Manage Plans' },
    { path: '/admin/users', icon: '👥', label: 'Manage Users' }
  ];

  sidebarOpen = false;

  constructor(private router: Router) {}

  getPageTitle(): string {
    const path = this.router.url;
    if (path.includes('/claims')) return 'Review Claims';
    if (path.includes('/plans')) return 'Manage Plans';
    if (path.includes('/users')) return 'Manage Users';
    return 'Admin Dashboard';
  }

  logout() {
    // Implement logout
    this.router.navigate(['/login']);
  }
}

// ============================================
// ADMIN DASHBOARD HOME
// src/app/components/admin/admin-dashboard/admin-dashboard.component.ts
// ============================================
@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [],
  template: `
    <div class="space-y-6">
      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        @for (stat of stats(); track stat) {
          <div
            class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
            <div class="flex items-center justify-between mb-4">
              <span class="text-3xl">{{ stat.icon }}</span>
              <span [class]="stat.trendColor + ' text-sm font-semibold'">
                {{ stat.trend }}
              </span>
            </div>
            <div class="text-3xl font-bold text-gray-800 mb-1">{{ stat.value }}</div>
            <div class="text-gray-600 text-sm">{{ stat.label }}</div>
          </div>
        }
      </div>
    
      <!-- Charts Row -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Claims Chart -->
        <div class="bg-white rounded-xl shadow-lg p-6">
          <h3 class="text-xl font-bold text-gray-800 mb-4">Claims Overview</h3>
          <div class="space-y-3">
            @for (item of claimsData(); track item) {
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div [class]="item.color" class="w-4 h-4 rounded-full"></div>
                  <span class="text-gray-700">{{ item.label }}</span>
                </div>
                <div class="flex items-center space-x-3">
                  <span class="font-bold text-gray-800">{{ item.value }}</span>
                  <div class="w-32 bg-gray-200 rounded-full h-2">
                    <div [class]="item.color"
                      [style.width.%]="item.percentage"
                    class="h-full rounded-full transition-all duration-500"></div>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
    
        <!-- Revenue Chart -->
        <div class="bg-white rounded-xl shadow-lg p-6">
          <h3 class="text-xl font-bold text-gray-800 mb-4">Monthly Revenue</h3>
          <div class="flex items-end justify-between h-48 space-x-2">
            @for (month of revenueData(); track month) {
              <div class="flex-1 flex flex-col items-center">
                <div class="w-full bg-linear-to-t from-purple-500 to-pink-500 rounded-t-lg transition-all duration-500 hover:opacity-80"
                [style.height.%]="(month.amount / maxRevenue) * 100"></div>
                <span class="text-xs text-gray-600 mt-2">{{ month.month }}</span>
              </div>
            }
          </div>
        </div>
      </div>
    
      <!-- Recent Activity -->
      <div class="bg-white rounded-xl shadow-lg p-6">
        <h3 class="text-xl font-bold text-gray-800 mb-4">Recent Activity</h3>
        <div class="space-y-3">
          @for (activity of recentActivity(); track activity) {
            <div
              class="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
              <div class="text-2xl shrink-0">{{ activity.icon }}</div>
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-gray-800 leading-tight">{{ activity.title }}</p>
                <p class="text-xs text-purple-400 mt-0.5">{{ activity.time }}</p>
                <p class="text-sm text-gray-600 mt-0.5">{{ activity.description }}</p>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
    `
})
export class AdminDashboardComponent implements OnInit {
  stats = signal<any[]>([
    { icon: '👥', value: '...', label: 'Total Users', trend: '', trendColor: 'text-green-600' },
    { icon: '🐾', value: '...', label: 'Total Pets', trend: '', trendColor: 'text-green-600' },
    { icon: '🛡️', value: '...', label: 'Active Policies', trend: '', trendColor: 'text-green-600' },
    { icon: '📈', value: '...', label: 'Approval Rate', trend: '', trendColor: 'text-green-600' }
  ]);

  claimsData = signal<any[]>([
    { label: 'Approved', value: 0, percentage: 0, color: 'bg-green-500' },
    { label: 'Pending', value: 0, percentage: 0, color: 'bg-yellow-500' },
    { label: 'Processing', value: 0, percentage: 0, color: 'bg-blue-500' },
    { label: 'Rejected', value: 0, percentage: 0, color: 'bg-red-500' }
  ]);

  revenueData = signal<any[]>([
    { month: 'Jan', amount: 95000 },
    { month: 'Feb', amount: 105000 },
    { month: 'Mar', amount: 98000 },
    { month: 'Apr', amount: 115000 },
    { month: 'May', amount: 108000 },
    { month: 'Jun', amount: 125000 }
  ]);

  maxRevenue = Math.max(...this.revenueData().map(d => d.amount));

  recentActivity = signal<any[]>([
    { icon: '📄', title: 'New Claim Submitted', description: 'User John Doe submitted claim #1234', time: '5 min ago' },
    { icon: '✅', title: 'Claim Approved', description: 'Claim #1230 approved for $450', time: '15 min ago' },
    { icon: '👤', title: 'New User Registration', description: 'Jane Smith joined PawProtect', time: '1 hour ago' },
    { icon: '📋', title: 'New Policy Created', description: 'Premium Plus plan activated', time: '2 hours ago' }
  ]);

  private http = inject(HttpClient);

  ngOnInit() {
    this.http.get<any>(API_ENDPOINTS.ADMIN.STATS).subscribe({
      next: (data) => {
        if (!data) return;
        
        const tUsers = data.totalUsers ?? 0;
        const tPets = data.totalPets ?? 0;
        const tPolicies = data.activePolicies ?? 0;
        const aRate = data.approvalRate ?? 0;
        
        this.stats.set([
          { icon: '👥', value: tUsers.toString(), label: 'Total Users', trend: '', trendColor: 'text-green-600' },
          { icon: '🐾', value: tPets.toString(), label: 'Total Pets', trend: '', trendColor: 'text-green-600' },
          { icon: '🛡️', value: tPolicies.toString(), label: 'Active Policies', trend: '', trendColor: 'text-green-600' },
          { icon: '📈', value: aRate.toFixed(1) + '%', label: 'Approval Rate', trend: '', trendColor: 'text-green-600' }
        ]);

        const appClaims = data.approvedClaims ?? 0;
        const pndClaims = data.pendingClaims ?? 0;
        const prcClaims = data.processingClaims ?? 0;
        const rejClaims = data.rejectedClaims ?? 0;
        const totalClaims = appClaims + pndClaims + prcClaims + rejClaims;
        
        this.claimsData.set([
          { label: 'Approved', value: appClaims, percentage: totalClaims ? Math.round((appClaims / totalClaims) * 100) : 0, color: 'bg-green-500' },
          { label: 'Pending', value: pndClaims, percentage: totalClaims ? Math.round((pndClaims / totalClaims) * 100) : 0, color: 'bg-yellow-500' },
          { label: 'Processing', value: prcClaims, percentage: totalClaims ? Math.round((prcClaims / totalClaims) * 100) : 0, color: 'bg-blue-500' },
          { label: 'Rejected', value: rejClaims, percentage: totalClaims ? Math.round((rejClaims / totalClaims) * 100) : 0, color: 'bg-red-500' }
        ]);
      },
      error: (err) => console.error('Failed to load dashboard stats', err)
    });
  }
}

