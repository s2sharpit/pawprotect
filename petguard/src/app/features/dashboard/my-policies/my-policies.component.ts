import { Component, signal, computed, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PolicyService } from '@core/services/policy.service';
import { Policy } from '@core/models/models';
import { rxResource } from '@angular/core/rxjs-interop';

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
      <div class="flex space-x-2 overflow-x-auto pb-1 -mx-1 px-1">
        @for (status of filterOptions; track status) {
        <button
          (click)="filterStatus.set(status)"
          [class]="filterStatus() === status ? 'bg-purple-500 text-white' : 'bg-white text-gray-700'"
          class="px-5 py-2 rounded-lg font-semibold transition hover:shadow-lg whitespace-nowrap shrink-0"
        >
          {{ status }}
        </button>
        }
      </div>

      <!-- Policies List -->
      <div class="space-y-4">
        @if (policiesResource.isLoading()) {
          <p class="text-gray-500 animate-pulse">Loading policies...</p>
        } @else if (policiesResource.error()) {
          <p class="text-red-500">Failed to load policies.</p>
        } @else {
          @for (policy of filteredPolicies(); track policy.id) {
          <div class="bg-white rounded-2xl shadow-lg hover:shadow-xl transition overflow-hidden">
            <div class="flex">
              <!-- Color Bar -->
              <div [class]="getStatusColor(policy.status)" class="w-2"></div>

              <!-- Policy Content -->
              <div class="flex-1 p-6">
                <div class="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div class="flex items-center space-x-3">
                    <div class="text-4xl">🐕</div>
                    <div>
                      <h3 class="text-xl font-bold text-gray-800">{{ policy.petName }}</h3>
                      <p class="text-gray-600">{{ policy.planName }}</p>
                    </div>
                  </div>
                  <span [class]="getStatusBadge(policy.status)" class="shrink-0 text-sm">
                    {{ policy.status }}
                  </span>
                </div>

                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p class="text-sm text-gray-600">Start Date</p>
                    <p class="font-bold text-gray-800">{{ policy.startDate }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-600">End Date</p>
                    <p class="font-bold text-gray-800">{{ policy.endDate }}</p>
                  </div>
                </div>

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
                  <button
                    (click)="cancelPolicy(policy.id)"
                    class="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-semibold hover:bg-red-100 transition"
                  >
                    Cancel
                  </button>
                  }
                </div>
              </div>
            </div>
          </div>
          }
        }
      </div>

      <!-- Empty State -->
      @if (!policiesResource.isLoading() && filteredPolicies().length === 0) {
      <div class="bg-white rounded-2xl shadow-lg p-12 text-center">
        <div class="text-6xl mb-4">🛡️</div>
        <h3 class="text-2xl font-bold text-gray-800 mb-2">
          No {{ filterStatus().toLowerCase() }} policies
        </h3>
        <p class="text-gray-600 mb-6">Browse our plans to get started</p>
        <button [routerLink]="['/dashboard/plans']" class="btn-primary">Browse Plans</button>
      </div>
      }
    </div>
  `,
})
export class MyPoliciesComponent {
  private policyService = inject(PolicyService);

  filterStatus = signal('All');
  filterOptions = ['All', 'ACTIVE', 'EXPIRED', 'CANCELLED'];

  policiesResource = rxResource({
    stream: () => this.policyService.getPolicies()
  });

  filteredPolicies = computed(() => {
    const status = this.filterStatus();
    const policies = this.policiesResource.value() || [];
    if (status === 'All') {
      return policies;
    }
    return policies.filter((p) => p.status === status);
  });

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

  cancelPolicy(id: number) {
    if (confirm('Are you sure you want to cancel this policy?')) {
      this.policyService.cancelPolicy(id).subscribe({
        next: () => {
          alert('Policy cancelled successfully! 🎉');
          this.policiesResource.reload();
        },
        error: (err) => {
          alert('Failed to cancel policy: ' + (err.error?.message || err.message));
        }
      });
    }
  }
}
