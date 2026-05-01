import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PetService } from '@core/services/pet.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { map, switchMap } from 'rxjs';
import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-pet-details',
  standalone: true,
  imports: [RouterModule, CommonModule],
  providers: [DatePipe, TitleCasePipe],
  template: `
    <div class="max-w-4xl mx-auto">
      <!-- Back Button -->
      <button 
        [routerLink]="['/dashboard/pets']"
        class="flex items-center text-gray-600 hover:text-purple-600 mb-6 font-semibold transition"
      >
        <span class="mr-2">←</span> Back to My Pets
      </button>

      @if (petResource.isLoading()) {
        <div class="bg-white rounded-3xl shadow-xl p-12 text-center animate-pulse">
          <div class="text-6xl mb-4">⌛</div>
          <p class="text-gray-500 text-xl font-bold">Fetching your pet's details...</p>
        </div>
      }

      @if (petResource.error()) {
        <div class="bg-red-50 rounded-3xl shadow-xl p-12 text-center border-2 border-red-100">
          <div class="text-6xl mb-4">❌</div>
          <p class="text-red-600 text-xl font-bold mb-4">Failed to load pet details</p>
          <button (click)="petResource.reload()" class="btn-primary">Try Again</button>
        </div>
      }

      @if (petResource.value(); as pet) {
        <div class="space-y-6 animate-slide-up">
          <!-- Profile Header -->
          <div class="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
            <div class="bg-linear-to-r from-purple-600 to-pink-500 h-48 flex items-center justify-center relative">
              <span class="text-9xl">{{ getPetEmoji(pet.species) }}</span>
              <div class="absolute bottom-0 right-0 p-6">
                <span [class]="getStatusBadge(pet.eligibilityStatus)">
                  {{ pet.eligibilityStatus }}
                </span>
              </div>
            </div>
            
            <div class="p-8">
              <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h1 class="text-4xl font-black text-gray-800 mb-2">{{ pet.name }}</h1>
                  <div class="flex flex-wrap gap-3">
                    <span class="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider">
                      {{ pet.breed }}
                    </span>
                    <span class="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider">
                      {{ pet.species }}
                    </span>
                    <span class="bg-pink-100 text-pink-600 px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider">
                      {{ pet.age }} Years Old
                    </span>
                    <span class="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider">
                      {{ pet.gender }}
                    </span>
                  </div>
                </div>
                
                <div class="flex space-x-3">
                  <button 
                    [routerLink]="['edit']"
                    class="btn-secondary px-6"
                  >
                    Edit Profile ✏️
                  </button>
                  <button 
                    [routerLink]="['/dashboard/claims/submit']"
                    [queryParams]="{ petId: pet.id }"
                    class="btn-primary px-6"
                  >
                    File a Claim 📄
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Detailed Info Cards -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Medical Summary -->
            <div class="md:col-span-2 space-y-6">
              <div class="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <span class="mr-3">📋</span> Medical Summary
                </h3>
                <p class="text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {{ pet.medicalSummary || 'No medical summary available for this pet.' }}
                </p>
              </div>

              <div class="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <span class="mr-3">🧬</span> Pre-existing Conditions
                </h3>
                @if (pet.preExistingConditions && pet.preExistingConditions.length > 0) {
                  <div class="flex flex-wrap gap-2">
                    @for (condition of pet.preExistingConditions; track condition) {
                      <span class="bg-orange-50 text-orange-600 px-4 py-2 rounded-xl font-semibold border border-orange-100">
                        {{ condition }}
                      </span>
                    }
                  </div>
                } @else {
                  <p class="text-gray-500 italic">No pre-existing conditions recorded.</p>
                }
              </div>
            </div>

            <!-- Eligibility & History -->
            <div class="space-y-6">
              <div class="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                <h3 class="text-xl font-bold text-gray-800 mb-4">AI Eligibility</h3>
                <div class="p-4 rounded-2xl mb-4" [class]="getEligibilityBg(pet.eligibilityStatus)">
                   <div class="font-bold mb-1">{{ pet.eligibilityStatus }}</div>
                   <div class="text-sm opacity-90">{{ pet.eligibilityReason }}</div>
                </div>
                <div class="text-xs text-gray-400 font-medium">
                  Checked on: {{ pet.eligibilityCheckedAt | date:'mediumDate' }}
                </div>
              </div>

              <div class="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                <h3 class="text-xl font-bold text-gray-800 mb-4">Quick Stats</h3>
                <div class="space-y-4">
                   <div class="flex justify-between items-center py-2 border-b border-gray-50">
                      <span class="text-gray-500 font-medium">Added on</span>
                      <span class="text-gray-800 font-bold">{{ pet.createdAt | date:'shortDate' }}</span>
                   </div>
                   <div class="flex justify-between items-center py-2 border-b border-gray-50">
                      <span class="text-gray-500 font-medium">Status</span>
                      <span class="text-green-600 font-bold">Active</span>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes slide-up {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-slide-up {
      animation: slide-up 0.5s ease-out;
    }
  `]
})
export class PetDetailsComponent {
  private petService = inject(PetService);
  private route = inject(ActivatedRoute);
  private titleCase = inject(TitleCasePipe);

  petResource = rxResource({
    stream: () => this.route.params.pipe(
      map(params => +params['id']),
      switchMap(id => this.petService.getPetById(id))
    )
  });

  getPetEmoji(species: string): string {
    const s = this.titleCase.transform(species);
    const emojis: Record<string, string> = {
      Dog: '🐕', Cat: '🐈', Bird: '🦜', Rabbit: '🐰', Hamster: '🐹',
    };
    return emojis[s] || '🐾';
  }

  getStatusBadge(status: string): string {
    const badges: Record<string, string> = {
      ELIGIBLE: 'bg-green-500 text-white px-4 py-2 rounded-full text-sm font-black shadow-lg',
      NOT_ELIGIBLE: 'bg-red-500 text-white px-4 py-2 rounded-full text-sm font-black shadow-lg',
      PENDING: 'bg-yellow-500 text-white px-4 py-2 rounded-full text-sm font-black shadow-lg',
    };
    return badges[status] || 'bg-gray-500 text-white px-4 py-2 rounded-full text-sm font-black shadow-lg';
  }

  getEligibilityBg(status: string): string {
    const bgs: Record<string, string> = {
      ELIGIBLE: 'bg-green-50 text-green-700 border border-green-100',
      NOT_ELIGIBLE: 'bg-red-50 text-red-700 border border-red-100',
      PENDING: 'bg-yellow-50 text-yellow-700 border border-yellow-100',
    };
    return bgs[status] || 'bg-gray-50 text-gray-700';
  }
}
