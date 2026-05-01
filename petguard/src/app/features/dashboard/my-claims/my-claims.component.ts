
import { Component, OnInit, inject, signal, computed } from "@angular/core";
import { RouterModule } from "@angular/router";
import { ClaimService } from '@core/services/claim.service';
import { Claim } from '@core/models/models';

@Component({
  selector: 'app-my-claims',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-gray-800">My Claims</h2>
          <p class="text-gray-600">Track your insurance claims</p>
        </div>
        <button [routerLink]="['/dashboard/claims/submit']"
          class="btn-primary flex items-center space-x-2">
          <span>➕</span>
          <span>Submit New Claim</span>
        </button>
      </div>
    
      <!-- Filter Tabs -->
      <div class="flex space-x-2">
        @for (status of filterOptions; track status) {
          <button
            (click)="filterStatus.set(status)"
            [class]="filterStatus() === status ? 'bg-purple-500 text-white' : 'bg-white text-gray-700'"
            class="px-6 py-2 rounded-lg font-semibold transition hover:shadow-lg">
            {{ status }}
          </button>
        }
      </div>
    
      <!-- Claims List -->
      <div class="space-y-4">
        @for (claim of filteredClaims(); track claim) {
          <div
            class="bg-white rounded-2xl shadow-lg hover:shadow-xl transition p-6">
            <!-- Header -->
            <div class="flex items-start justify-between mb-6">
              <div class="flex items-center space-x-4">
                <div [class]="getStatusIcon(claim.status).color"
                  class="w-12 h-12 rounded-full flex items-center justify-center text-2xl">
                  {{ getStatusIcon(claim.status).icon }}
                </div>
                <div>
                  <h3 class="text-xl font-bold text-gray-800">{{ claim.treatmentType }}</h3>
                  <p class="text-gray-600">{{ claim.petName }} • {{ claim.treatmentDate }}</p>
                </div>
              </div>
              <span [class]="getStatusBadge(claim.status)">
                {{ claim.status }}
              </span>
            </div>
            <!-- Progress Timeline -->
            <div class="mb-6">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-semibold text-gray-700">Submitted</span>
                <span class="text-sm font-semibold text-gray-700">Processing</span>
                <span class="text-sm font-semibold text-gray-700">Decided</span>
              </div>
              <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div [style.width.%]="getProgressWidth(claim.status)"
                  [class]="getProgressColor(claim.status)"
                  class="h-full transition-all duration-500">
                </div>
              </div>
            </div>
            <!-- Claim Details Grid -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div>
                <p class="text-sm text-gray-600">Claim Amount</p>
                <p class="text-xl font-bold text-gray-800">\${{ claim.claimAmount }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Approved Amount</p>
                <p class="text-xl font-bold text-green-600">
                  {{ claim.approvedAmount ? '$' + claim.approvedAmount : '-' }}
                </p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Deductible</p>
                <p class="text-xl font-bold text-gray-800">
                  {{ claim.deductibleApplied ? '$' + claim.deductibleApplied : '-' }}
                </p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Vet Clinic</p>
                <p class="text-sm font-bold text-gray-800">{{ claim.vetClinicName }}</p>
              </div>
            </div>
            <!-- Decision Reason -->
            @if (claim.decisionReason) {
              <div
                [class]="claim.status === 'APPROVED' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'"
                class="border-2 rounded-lg p-4 mb-4">
                <p class="text-sm font-semibold text-gray-700 mb-1">Decision Reason</p>
                <p class="text-gray-700">{{ claim.decisionReason }}</p>
              </div>
            }
            <!-- Actions -->
            <div class="flex space-x-3">
              <button class="flex-1 bg-purple-50 text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-purple-100 transition">
                View Full Details
              </button>
              @if (claim.status === 'REJECTED') {
                <button
                  class="flex-1 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-100 transition">
                  Appeal Decision
                </button>
              }
            </div>
          </div>
        }
      </div>
    
      <!-- Empty State -->
      @if (filteredClaims().length === 0) {
        <div
          class="bg-white rounded-2xl shadow-lg p-12 text-center">
          <div class="text-6xl mb-4">📄</div>
          <h3 class="text-2xl font-bold text-gray-800 mb-2">No {{ filterStatus().toLowerCase() }} claims</h3>
          <p class="text-gray-600 mb-6">Submit your first claim to get started</p>
          <button [routerLink]="['/dashboard/claims/submit']" class="btn-primary">
            Submit Claim
          </button>
        </div>
      }
    </div>
    `
})
export class MyClaimsComponent implements OnInit {
  filterStatus = signal<'All' | 'PENDING' | 'PROCESSING' | 'APPROVED' | 'REJECTED'>('All');
  filterOptions: Array<'All' | 'PENDING' | 'PROCESSING' | 'APPROVED' | 'REJECTED'> = ['All', 'PENDING', 'PROCESSING', 'APPROVED', 'REJECTED'];
  claims = signal<Claim[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  private claimService = inject(ClaimService);

  filteredClaims = computed(() => {
    const status = this.filterStatus();
    const allClaims = this.claims();
    if (status === 'All') return allClaims;
    return allClaims.filter(c => c.status === status);
  });

  ngOnInit() {
    this.fetchClaims();
  }

  fetchClaims() {
    this.loading.set(true);
    this.error.set(null);
    this.claimService.getClaims().subscribe({
      next: (data) => {
        this.claims.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load claims.');
        this.loading.set(false);
      }
    });
  }

  getStatusIcon(status: string) {
    const icons: any = {
      'PENDING': { icon: '⏳', color: 'bg-yellow-100 text-yellow-600' },
      'PROCESSING': { icon: '⚙️', color: 'bg-blue-100 text-blue-600' },
      'APPROVED': { icon: '✅', color: 'bg-green-100 text-green-600' },
      'REJECTED': { icon: '❌', color: 'bg-red-100 text-red-600' }
    };
    return icons[status] || { icon: '📄', color: 'bg-gray-100 text-gray-600' };
  }

  getStatusBadge(status: string): string {
    const badges: any = {
      'PENDING': 'bg-yellow-100 text-yellow-600 px-4 py-2 rounded-full font-semibold',
      'PROCESSING': 'bg-blue-100 text-blue-600 px-4 py-2 rounded-full font-semibold',
      'APPROVED': 'bg-green-100 text-green-600 px-4 py-2 rounded-full font-semibold',
      'REJECTED': 'bg-red-100 text-red-600 px-4 py-2 rounded-full font-semibold'
    };
    return badges[status] || '';
  }

  getProgressWidth(status: string): number {
    const widths: any = {
      'PENDING': 33,
      'PROCESSING': 66,
      'APPROVED': 100,
      'REJECTED': 100
    };
    return widths[status] || 0;
  }

  getProgressColor(status: string): string {
    if (status === 'REJECTED') return 'bg-red-500';
    if (status === 'APPROVED') return 'bg-green-500';
    return 'bg-gradient-to-r from-purple-500 to-pink-500';
  }
}
