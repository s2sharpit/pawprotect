import { MatSnackBar } from '@angular/material/snack-bar';
import { Component, signal, inject, ChangeDetectionStrategy, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InsurancePlan, Pet } from '@core/models/models';
import { PlanService } from '@core/services/plan.service';
import { PolicyService } from '@core/services/policy.service';
import { PetStore } from '@core/store/pet.store';
import { PlanComparison } from './plan-comparison';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';

@Component({
  selector: 'app-browse-plans',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, PlanComparison],
  template: `
    <div class="space-y-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">Choose Your Plan</h2>
        <p class="text-gray-600">Select the perfect insurance coverage for your pet</p>
      </div>

      <!-- Pet Selection -->
      <section class="bg-white rounded-xl shadow-lg p-6">
        <label class="block text-sm font-semibold text-gray-700 mb-3">Select Pet</label>
        @if (petStore.pets().length === 0 && petStore.isLoading()) {
        <div class="h-12 bg-gray-200 rounded animate-pulse"></div>
        } @else {
        <select [(ngModel)]="selectedPetId" class="input-field max-w-md">
          <option [ngValue]="null">Choose a pet...</option>
          @for (pet of petStore.pets(); track pet.id) {
          <option [ngValue]="pet.id">{{ pet.name }} ({{ pet.breed }})</option>
          }
        </select>
        }
      </section>

      <!-- Plans Grid -->
      @defer (when plans().length > 0) {
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 py-8">
        @for (plan of plans(); track plan.id; let i = $index) {
        <div
          class="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col"
          [ngClass]="{
            'ring-4 ring-purple-500 transform scale-105': plan.isPopular
          }"
        >
          <!-- Popular Badge -->
          @if (plan.isPopular) {
          <div
            class="bg-linear-to-r from-purple-500 to-pink-500 text-white text-center py-2 rounded-t-2xl font-bold"
          >
            ⭐ MOST POPULAR
          </div>
          }

          <div class="p-6 flex-1 flex flex-col">
            <!-- Plan Icon -->
            <div class="text-5xl mb-4 text-center">
              {{ planIcons[i] }}
            </div>

            <!-- Plan Name & Price -->
            <h3 class="text-2xl font-bold text-gray-800 text-center mb-2">
              {{ plan.name }}
            </h3>
            <div class="text-center mb-6">
              <span class="text-4xl font-bold text-purple-600">\${{ plan.monthlyPremium }}</span>
              <span class="text-gray-600">/month</span>
            </div>

            <!-- Features -->
            <ul class="space-y-3 mb-6">
              <li class="flex items-start">
                <span class="text-green-500 mr-2">✓</span>
                <span class="text-gray-700">
                  Coverage up to <strong>\${{ plan.coverageLimit.toLocaleString() }}</strong>
                </span>
              </li>
              <li class="flex items-start">
                <span class="text-green-500 mr-2">✓</span>
                <span class="text-gray-700"> \${{ plan.deductible }} deductible </span>
              </li>
              <li class="flex items-start">
                <span class="text-green-500 mr-2">✓</span>
                <span class="text-gray-700">Emergency care included</span>
              </li>
              <li class="flex items-start">
                <span class="text-green-500 mr-2">✓</span>
                <span class="text-gray-700"
                  >{{ i === 0 ? 'Basic' : i === 1 ? 'Priority' : '24/7' }} support</span
                >
              </li>
              @if (i >= 1) {
              <li class="flex items-start">
                <span class="text-green-500 mr-2">✓</span>
                <span class="text-gray-700">Prescription medications</span>
              </li>
              } @if (i === 2) {
              <li class="flex items-start">
                <span class="text-green-500 mr-2">✓</span>
                <span class="text-gray-700">Wellness & preventive care</span>
              </li>
              }
            </ul>

            <!-- Subscribe Button -->
            <button
              (click)="subscribeToPlan(plan.id)"
              [disabled]="!selectedPetId()"
              [class]="(plan.isPopular ? 'btn-primary' : 'btn-secondary') + ' w-full mt-auto'"
            >
              {{ !selectedPetId() ? 'Select a pet first' : 'Choose Plan' }}
            </button>
          </div>
        </div>
        }
      </div>
      } @placeholder {
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 h-64">
        <div class="bg-gray-100 rounded-2xl animate-pulse p-6"></div>
        <div class="bg-gray-100 rounded-2xl animate-pulse p-6"></div>
        <div class="bg-gray-100 rounded-2xl animate-pulse p-6"></div>
      </div>
      }

      <!-- Comparison Table -->
      <app-plan-comparison [plans]="plans()" />
    </div>
  `,
})
export class BrowsePlans {
  private planService = inject(PlanService);
  private policyService = inject(PolicyService);
  public petStore = inject(PetStore);
  private snacBar = inject(MatSnackBar);
  private router = inject(Router);

  // Reactive Signals
  plans: Signal<InsurancePlan[]> = toSignal(this.planService.getActivePlans(), {
    initialValue: [],
  });

  selectedPetId = signal<number | null>(null);

  constructor() {
    if (this.petStore.pets().length === 0) {
      this.petStore.loadPets();
    }
  }

  // Precomputed statics
  planIcons = ['🥉', '🥈', '🥇'] as const;
  supportLevels = ['Basic', 'Priority', 'Premium'] as const;

  subscribeToPlan(planId: number) {
    const petId = this.selectedPetId();
    if (!petId) return;

    this.policyService
      .subscribeToPlan(petId, planId)
      // .pipe(takeUntilDestroyed())
      .subscribe({
        next: () => {
          this.snacBar.open('Successfully subscribed to plan!', 'Ok', { duration: 2000 });
          this.router.navigate(['/dashboard/policies']);
        },
        error: (err) =>
          this.snacBar.open('Error subscribing to plan: ' + (err.error?.message || err.message), 'Dismiss', {
            duration: 5000,
            panelClass: ['error-snackbar'],
          }),
      });
  }
}
