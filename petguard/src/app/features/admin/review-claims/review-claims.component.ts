import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClaimService } from '@core/services/claim.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Component({
  selector: 'app-review-claims',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Filter Bar -->
      <div class="bg-white rounded-xl shadow-lg p-6">
        <div class="flex flex-col md:flex-row gap-4">
          <div class="flex-1">
            <input
              type="text"
              [(ngModel)]="searchQuery"
              placeholder="Search by pet name, or claim ID..."
              class="input-field">
            </div>
            <select [(ngModel)]="statusFilter" class="input-field w-48">
              <option value="All">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>
    
        <!-- Claims List -->
        <div class="space-y-4">
          @if (claimsResource.isLoading()) {
            <p class="text-gray-500 animate-pulse">Loading claims...</p>
          } @else if (claimsResource.error()) {
            <p class="text-red-500">Failed to load claims.</p>
          } @else {
            @for (claim of filteredClaims(); track claim.id) {
              <div
                class="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition">
                <!-- Claim Header -->
                <div class="bg-linear-to-r from-purple-50 to-pink-50 p-4 md:p-6 border-b">
                  <div class="flex flex-wrap items-start justify-between gap-3">
                    <div class="min-w-0">
                      <h3 class="text-lg md:text-xl font-bold text-gray-800 mb-1">
                        Claim #{{ claim.id }} - {{ claim.petName }}
                      </h3>
                      <p class="text-gray-600 text-sm">
                        Policy #{{ claim.policyId }} • Submitted on {{ claim.createdAt | date:'mediumDate' }}
                      </p>
                    </div>
                    <span [class]="getStatusBadge(claim.status)" class="shrink-0 text-sm">
                      {{ claim.status }}
                    </span>
                  </div>
                </div>
                <!-- Claim Details -->
                <div class="p-4 md:p-6">
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div>
                      <p class="text-sm text-gray-600 mb-1">Treatment Date</p>
                      <p class="font-bold text-gray-800">{{ claim.treatmentDate | date:'mediumDate' }}</p>
                    </div>
                    <div>
                      <p class="text-sm text-gray-600 mb-1">Vet Clinic</p>
                      <p class="font-bold text-gray-800">{{ claim.vetClinicName }}</p>
                    </div>
                    <div>
                      <p class="text-sm text-gray-600 mb-1">Treatment Type</p>
                      <p class="font-bold text-gray-800">{{ claim.treatmentType || 'Unknown' }}</p>
                    </div>
                    <div>
                      <p class="text-sm text-gray-600 mb-1">Claim Amount</p>
                      <p class="text-2xl font-bold text-purple-600">\${{ claim.claimAmount }}</p>
                    </div>
                  </div>
                  <!-- Diagnosis -->
                  <div class="mb-6">
                    <p class="text-sm font-semibold text-gray-700 mb-2">Diagnosis</p>
                    <p class="text-gray-800 bg-gray-50 p-4 rounded-lg">{{ claim.diagnosis || 'No diagnosis provided' }}</p>
                  </div>
                  <!-- Medications -->
                  @if (claim.medications) {
                    <div class="mb-6">
                      <p class="text-sm font-semibold text-gray-700 mb-2">Medications</p>
                      <p class="text-gray-800 bg-gray-50 p-4 rounded-lg">{{ claim.medications || 'None' }}</p>
                    </div>
                  }
                  <!-- Decision Form -->
                  @if (claim.status === 'PENDING' || claim.status === 'PROCESSING') {
                    <div class="border-t pt-6">
                      <h4 class="font-bold text-gray-800 mb-4">Review Decision</h4>
                      <div class="space-y-4">
                        <!-- Decision Type -->
                        <div class="flex space-x-4">
                          <button
                            (click)="claim.reviewDecision = 'APPROVED'; setApprovedAmount(claim)"
                            [class]="claim.reviewDecision === 'APPROVED' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700'"
                            class="flex-1 py-3 rounded-lg font-semibold transition hover:opacity-90">
                            ✅ Approve
                          </button>
                          <button
                            (click)="claim.reviewDecision = 'REJECTED'; claim.approvedAmount = 0"
                            [class]="claim.reviewDecision === 'REJECTED' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700'"
                            class="flex-1 py-3 rounded-lg font-semibold transition hover:opacity-90">
                            ❌ Reject
                          </button>
                        </div>
                        <!-- Approved Amount (always shown if decided to ensure correct amount) -->
                        @if (claim.reviewDecision === 'APPROVED') {
                          <div>
                            <label class="block text-sm font-semibold text-gray-700 mb-2">Approved Amount</label>
                            <div class="relative">
                              <span class="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600">$</span>
                              <input
                                type="number"
                                [(ngModel)]="claim.approvedAmount"
                                class="input-field pl-8"
                                placeholder="0.00">
                              </div>
                            </div>
                          }
                          <!-- Decision Reason -->
                          @if (claim.reviewDecision) {
                            <div>
                              <label class="block text-sm font-semibold text-gray-700 mb-2">Decision Reason *</label>
                              <textarea
                                [(ngModel)]="claim.decisionReason"
                                rows="3"
                                class="input-field resize-none"
                              placeholder="Explain your decision..."></textarea>
                            </div>
                          }
                          <!-- Submit Decision -->
                          <button
                            (click)="submitDecision(claim)"
                            [disabled]="!claim.reviewDecision || !claim.decisionReason || (claim.reviewDecision === 'APPROVED' && (!claim.approvedAmount || claim.approvedAmount <= 0))"
                            class="btn-primary w-full disabled:opacity-50">
                            Submit Decision
                          </button>
                        </div>
                      </div>
                    }
                    <!-- Already Reviewed -->
                    @if (claim.status === 'APPROVED' || claim.status === 'REJECTED') {
                      <div
                        [class]="claim.status === 'APPROVED' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'"
                        class="border-2 rounded-xl p-4">
                        <p class="font-semibold mb-2">
                          {{ claim.status === 'APPROVED' ? '✅ This claim has been approved' : '❌ This claim has been rejected' }}
                        </p>
                        <div class="text-sm">
                          @if (claim.status === 'APPROVED') {
                            <p><strong>Approved Amount:</strong> \${{ claim.approvedAmount }}</p>
                          }
                          <p><strong>Reason:</strong> {{ claim.decisionReason }}</p>
                          <p><strong>Reviewed By:</strong> {{ claim.reviewedByName }} on {{ claim.reviewedAt | date:'mediumDate' }}</p>
                        </div>
                      </div>
                    }
                  </div>
                </div>
              }
            }
          </div>
    
          <!-- Empty State -->
          @if (!claimsResource.isLoading() && filteredClaims().length === 0) {
            <div
              class="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div class="text-6xl mb-4">📄</div>
              <h3 class="text-2xl font-bold text-gray-800 mb-2">No claims to review</h3>
              <p class="text-gray-600">No claims match your filter criteria.</p>
            </div>
          }
        </div>
    `
})
export class ReviewClaimsComponent {
  private claimService = inject(ClaimService);

  searchQuery = signal('');
  statusFilter = signal('All');

  claimsResource = rxResource<any[], string>({
    params: () => this.statusFilter(),
    stream: ({ params: status }) => this.claimService.getAdminClaims(status).pipe(
      map(data => data.map(c => ({
        ...c,
        reviewDecision: null,
        approvedAmount: null,
        decisionReason: ''
      })))
    )
  });

  filteredClaims = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const sourceClaims = this.claimsResource.value() || [];

    return sourceClaims.filter(claim => {
      const matchesSearch = !query ||
        (claim.petName && claim.petName.toLowerCase().includes(query)) ||
        claim.id.toString().includes(query);

      return matchesSearch;
    });
  });

  getStatusBadge(status: string): string {
    const badges: any = {
      'PENDING': 'bg-yellow-100 text-yellow-600 px-4 py-2 rounded-full font-semibold',
      'PROCESSING': 'bg-blue-100 text-blue-600 px-4 py-2 rounded-full font-semibold',
      'APPROVED': 'bg-green-100 text-green-600 px-4 py-2 rounded-full font-semibold',
      'REJECTED': 'bg-red-100 text-red-600 px-4 py-2 rounded-full font-semibold'
    };
    return badges[status] || 'bg-gray-100 text-gray-600 px-4 py-2 rounded-full font-semibold';
  }

  setApprovedAmount(claim: any) {
    if (!claim.approvedAmount) {
      claim.approvedAmount = claim.claimAmount;
    }
  }

  submitDecision(claim: any) {
    if (!claim.reviewDecision || !claim.decisionReason) {
      alert('Please provide a decision and reason');
      return;
    }

    const payload = {
      status: claim.reviewDecision,
      approvedAmount: claim.reviewDecision === 'APPROVED' ? claim.approvedAmount : 0,
      decisionReason: claim.decisionReason
    };

    this.claimService.adminReviewClaim(claim.id, payload).subscribe({
      next: (updatedClaim) => {
        alert(`Claim #${claim.id} has been ${payload.status.toLowerCase()} 🎉`);

        this.claimsResource.update(allClaims => {
          if (!allClaims) return allClaims;
          const idx = allClaims.findIndex(c => c.id === claim.id);
          if (idx !== -1) {
            const newArray = [...allClaims];
            newArray[idx] = { ...newArray[idx], ...updatedClaim, reviewDecision: null };
            return newArray;
          }
          return allClaims;
        });
      },
      error: (e) => {
        console.error('Error saving decision', e);
        alert('Failed to submit decision: ' + (e.error?.message || 'Unknown error'));
      }
    });
  }
}
