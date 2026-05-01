
import { Component, OnInit, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PolicyService } from '@core/services/policy.service';
import { Policy } from '@core/models/models';

@Component({
  selector: 'app-my-policies',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="space-y-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">My Policies</h2>
        <p class="text-gray-600">View and manage your insurance policies</p>
      </div>

      <!-- Filter Tabs -->
      <div class="flex space-x-2">
        @for (status of filterOptions; track status) {
        <button
          (click)="filterStatus = status"
          [class]="filterStatus === status ? 'bg-purple-500 text-white' : 'bg-white text-gray-700'"
          class="px-6 py-2 rounded-lg font-semibold transition hover:shadow-lg"
        >
          {{ status }}
        </button>
        }
      </div>

      <!-- Policies List -->
      <div class="space-y-4">
        @for (policy of getFilteredPolicies(); track policy.id) {
        <div class="bg-white rounded-2xl shadow-lg hover:shadow-xl transition overflow-hidden">
          <div class="flex">
            <!-- Color Bar -->
            <div [class]="getStatusColor(policy.status || '')" class="w-2"></div>

            <!-- Policy Content -->
            <div class="flex-1 p-6">
              <div class="flex items-start justify-between mb-4">
                <div class="flex items-center space-x-4">
                  <div class="text-4xl">🐕</div>
                  <div>
                    <h3 class="text-xl font-bold text-gray-800">{{ policy.petName }}</h3>
                    <p class="text-gray-600">{{ policy.planName }}</p>
                  </div>
                </div>
                <span [class]="getStatusBadge(policy.status ?? '')">
                  {{ policy.status }}
                </span>
              </div>

              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <!-- <div>
                  <p class="text-sm text-gray-600">Premium</p>
                  <p class="font-bold text-gray-800">\${{ policy.premium }}/mo</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Coverage</p>
                  <p class="font-bold text-gray-800">\${{ policy.coverage.toLocaleString() }}</p>
                </div> -->
                <div>
                  <p class="text-sm text-gray-600">Start Date</p>
                  <p class="font-bold text-gray-800">{{ policy.startDate }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">End Date</p>
                  <p class="font-bold text-gray-800">{{ policy.endDate }}</p>
                </div>
              </div>

              <!-- Progress Bar -->
              <!-- <div class="mb-4">
                <div class="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Coverage Used</span>
                  <span>\${{ policy.usedCoverage.toLocaleString() }} / \${{ policy.coverage.toLocaleString() }}</span>
                </div>
                <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div [style.width.%]="(policy.usedCoverage / policy.coverage) * 100"
                       class="h-full bg-linear-to-r from-purple-500 to-pink-500 transition-all duration-500">
                  </div>
                </div>
              </div> -->

              <!-- Actions -->
              <div class="flex space-x-3">
                <button
                  class="flex-1 bg-purple-50 text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-purple-100 transition"
                >
                  View Details
                </button>
                <button
                  [routerLink]="['/dashboard/claims/submit']"
                  class="flex-1 bg-green-50 text-green-600 px-4 py-2 rounded-lg font-semibold hover:bg-green-100 transition"
                >
                  File Claim
                </button>
                @if (policy.status === 'ACTIVE') {
                <button class="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-semibold hover:bg-red-100 transition">
                  Cancel
                </button>
                }
              </div>
            </div>
          </div>
        </div>
        }
      </div>

      <!-- Empty State -->
      @if (getFilteredPolicies().length === 0) {
      <div class="bg-white rounded-2xl shadow-lg p-12 text-center">
        <div class="text-6xl mb-4">🛡️</div>
        <h3 class="text-2xl font-bold text-gray-800 mb-2">
          No {{ filterStatus.toLowerCase() }} policies
        </h3>
        <p class="text-gray-600 mb-6">Browse our plans to get started</p>
        <button [routerLink]="['/dashboard/plans']" class="btn-primary">Browse Plans</button>
      </div>
      }
    </div>
  `,
})
export class MyPoliciesComponent implements OnInit {
  filterStatus = 'All';
  filterOptions = ['All', 'ACTIVE', 'EXPIRED', 'CANCELLED'];
  policies = signal<Partial<Policy>[]>([]);

  constructor(private policyService: PolicyService) {}

  ngOnInit() {
    this.policyService.getPolicies().subscribe({
      next: (data: Policy[]) => {
        // Map API data to UI format
        console.log(data);

        this.policies.set(
          data.map((policy) => ({
            id: policy.id,
            petName: policy.petName || 'Unknown',
            planName: policy.planName || 'Unknown',
            // premium: policy.plan?.monthlyPremium || 0,
            // coverage: policy.plan?.coverageLimit || 0,
            // usedCoverage: 0, // If you have a field for this, replace 0 with policy.usedCoverage
            status: policy.status,
            startDate: policy.startDate,
            endDate: policy.endDate,
          }))
        );
      },
      error: () => {
        this.policies.set([]);
      },
    });
  }

  getFilteredPolicies() {
    if (this.filterStatus === 'All') {
      return this.policies();
    }
    return this.policies().filter((p) => p.status === this.filterStatus);
  }

  getStatusColor(status: string): string {
    const colors: any = {
      ACTIVE: 'bg-green-500',
      EXPIRED: 'bg-gray-400',
      CANCELLED: 'bg-red-500',
    };
    return colors[status] || 'bg-gray-400';
  }

  getStatusBadge(status: string): string {
    const badges: any = {
      ACTIVE: 'bg-green-100 text-green-600 px-4 py-2 rounded-full font-semibold',
      EXPIRED: 'bg-gray-100 text-gray-600 px-4 py-2 rounded-full font-semibold',
      CANCELLED: 'bg-red-100 text-red-600 px-4 py-2 rounded-full font-semibold',
    };
    return badges[status] || '';
  }
}
