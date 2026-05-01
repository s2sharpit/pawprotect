import { DatePipe } from "@angular/common";
import { Component, OnInit, inject, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { RouterModule } from "@angular/router";
import { API_ENDPOINTS } from "@core/constants/api.endpoints";

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [RouterModule],
  providers: [DatePipe],
  template: `
    <div class="space-y-6">
      <!-- Welcome Banner -->
      <div class="bg-linear-to-r from-purple-500 to-pink-500 rounded-2xl p-8 text-white">
        <h2 class="text-3xl font-bold mb-2">Welcome back! 👋</h2>
        <p class="text-white/90">Here's what's happening with your pets today.</p>
      </div>
    
      <!-- Quick Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        @for (stat of stats(); track stat) {
          <div
            class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
            <div class="flex items-center justify-between mb-4">
              <span class="text-3xl">{{ stat.icon }}</span>
              <span [class]="stat.color + ' px-3 py-1 rounded-full text-sm font-semibold'">
                {{ stat.change }}
              </span>
            </div>
            <div class="text-3xl font-bold text-gray-800 mb-1">{{ stat.value }}</div>
            <div class="text-gray-600">{{ stat.label }}</div>
          </div>
        }
      </div>
    
      <!-- Quick Actions -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        @for (action of quickActions; track action) {
          <button
            [routerLink]="action.path"
            class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition hover:scale-105 transform text-left">
            <div class="text-4xl mb-4">{{ action.icon }}</div>
            <h3 class="text-xl font-bold text-gray-800 mb-2">{{ action.title }}</h3>
            <p class="text-gray-600">{{ action.description }}</p>
          </button>
        }
      </div>
    
      <!-- Recent Activity -->
      <div class="bg-white rounded-xl shadow-lg p-6">
        <h3 class="text-xl font-bold text-gray-800 mb-4">Recent Activity</h3>
        <div class="space-y-4">
          @for (activity of recentActivity(); track activity) {
            <div
              class="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
              <div class="text-2xl">{{ activity.icon }}</div>
              <div class="flex-1">
                <p class="font-semibold text-gray-800">{{ activity.title }}</p>
                <p class="text-sm text-gray-600">{{ activity.description }}</p>
              </div>
              <div class="text-sm text-gray-500">{{ activity.time }}</div>
            </div>
          }
        </div>
      </div>
    </div>
    `
})
export class DashboardHomeComponent implements OnInit {
  private http = inject(HttpClient);
  private datePipe = inject(DatePipe);

  stats = signal<any[]>([
    { icon: '🐕', value: '...', label: 'My Pets', change: '', color: 'bg-blue-100 text-blue-600' },
    { icon: '🛡️', value: '...', label: 'Active Policies', change: '', color: 'bg-green-100 text-green-600' },
    { icon: '📄', value: '...', label: 'Total Claims', change: '', color: 'bg-purple-100 text-purple-600' },
    { icon: '✅', value: '...', label: 'Approval Rate', change: '', color: 'bg-pink-100 text-pink-600' }
  ]);

  quickActions = [
    { icon: '➕', title: 'Add New Pet', description: 'Register a new pet with AI eligibility check', path: '/dashboard/pets/add' },
    { icon: '📋', title: 'Browse Plans', description: 'Find the perfect insurance plan', path: '/dashboard/plans' },
    { icon: '📄', title: 'Submit Claim', description: 'File a new insurance claim', path: '/dashboard/claims/submit' }
  ];

  recentActivity = signal<any[]>([
    { icon: '⏳', title: 'Loading Activity...', description: 'Fetching your recent history...', time: 'Just now' }
  ]);

  ngOnInit() {
    this.http.get<any>(API_ENDPOINTS.DASHBOARD.STATS).subscribe({
      next: (data) => {
        if (!data) return;

        const tPets = data.totalPets ?? 0;
        const aPolicies = data.activePolicies ?? 0;
        const tClaims = data.totalClaims ?? 0;
        const aRate = data.approvalRate ?? 0;

        this.stats.set([
          { icon: '🐕', value: tPets.toString(), label: 'My Pets', change: 'Current', color: 'bg-blue-100 text-blue-600' },
          { icon: '🛡️', value: aPolicies.toString(), label: 'Active Policies', change: 'Active', color: 'bg-green-100 text-green-600' },
          { icon: '📄', value: tClaims.toString(), label: 'Total Claims', change: 'Total', color: 'bg-purple-100 text-purple-600' },
          { icon: '✅', value: aRate.toFixed(1) + '%', label: 'Approval Rate', change: 'Average', color: 'bg-pink-100 text-pink-600' }
        ]);

        if (data.recentActivity && data.recentActivity.length > 0) {
          const mapped = data.recentActivity.map((act: any) => ({
            icon: act.icon,
            title: act.title,
            description: act.description,
            time: this.datePipe.transform(act.timestamp, 'short')
          }));
          this.recentActivity.set(mapped);
        } else {
          this.recentActivity.set([
            { icon: '👋', title: 'Welcome to PawProtect', description: 'Add your first pet to get started!', time: 'Just now' }
          ]);
        }
      },
      error: (e) => console.error('Failed to load user dashboard stats', e)
    });
  }
}
