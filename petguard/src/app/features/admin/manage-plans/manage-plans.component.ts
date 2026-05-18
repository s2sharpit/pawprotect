
import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { PlanService } from '@core/services/plan.service';
import { InsurancePlan } from '@core/models/models';

@Component({
  selector: 'app-manage-plans',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 class="text-xl md:text-2xl font-bold text-gray-800">Manage Insurance Plans</h2>
          <p class="text-gray-600 text-sm">Create and edit insurance plan offerings</p>
        </div>
        <button (click)="showCreateForm.set(true)" class="btn-primary flex items-center space-x-2 shrink-0">
          <span>➕</span>
          <span>Create New Plan</span>
        </button>
      </div>
    
      <!-- Create/Edit Plan Form -->
      @if (showCreateForm() || editingPlan()) {
        <div
          class="bg-white rounded-2xl shadow-lg p-8 animate-slide-down"
          >
          <h3 class="text-xl font-bold text-gray-800 mb-6">
            {{ editingPlan() ? 'Edit Plan' : 'Create New Plan' }}
          </h3>
          <form [formGroup]="planForm" (ngSubmit)="savePlan()" class="space-y-6">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Plan Name *</label>
                <input
                  type="text"
                  formControlName="name"
                  class="input-field"
                  placeholder="e.g., Premium Plus"
                  />
                  @if (planForm.get('name')?.invalid && planForm.get('name')?.touched) {
                    <div
                      class="text-red-500 text-xs mt-1"
                      >
                      Name is required.
                    </div>
                  }
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2"
                    >Monthly Premium ($) *</label
                    >
                    <input
                      type="number"
                      formControlName="monthlyPremium"
                      class="input-field"
                      placeholder="49.99"
                      />
                      @if (
                        planForm.get('monthlyPremium')?.invalid && planForm.get('monthlyPremium')?.touched
                        ) {
                        <div
                          class="text-red-500 text-xs mt-1"
                          >
                          Monthly premium is required and must be positive.
                        </div>
                      }
                    </div>
                    <div>
                      <label class="block text-sm font-semibold text-gray-700 mb-2"
                        >Coverage Limit ($) *</label
                        >
                        <input
                          type="number"
                          formControlName="coverageLimit"
                          class="input-field"
                          placeholder="10000"
                          />
                          @if (
                            planForm.get('coverageLimit')?.invalid && planForm.get('coverageLimit')?.touched
                            ) {
                            <div
                              class="text-red-500 text-xs mt-1"
                              >
                              Coverage limit is required and must be positive.
                            </div>
                          }
                        </div>
                        <div>
                          <label class="block text-sm font-semibold text-gray-700 mb-2">Deductible ($) *</label>
                          <input
                            type="number"
                            formControlName="deductible"
                            class="input-field"
                            placeholder="100"
                            />
                            @if (planForm.get('deductible')?.invalid && planForm.get('deductible')?.touched) {
                              <div
                                class="text-red-500 text-xs mt-1"
                                >
                                Deductible is required and must be positive.
                              </div>
                            }
                          </div>
                        </div>
                        <div>
                          <label class="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                          <textarea
                            formControlName="description"
                            rows="3"
                            class="input-field resize-none"
                            placeholder="Comprehensive coverage for your pet's health..."
                          ></textarea>
                        </div>
                        <div>
                          <label class="flex items-center">
                            <input
                              type="checkbox"
                              formControlName="isActive"
                              class="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                              />
                              <span class="ml-2 text-sm font-semibold text-gray-700"
                                >Plan is active and available to users</span
                                >
                              </label>
                            </div>
                            <div class="flex flex-col sm:flex-row gap-3">
                              <button type="button" (click)="cancelForm()" class="btn-secondary flex-1">
                                Cancel
                              </button>
                              <button type="submit" class="btn-primary flex-1">
                                {{ editingPlan() ? 'Update Plan' : 'Create Plan' }}
                              </button>
                            </div>
                          </form>
                        </div>
                      }
    
                      <!-- Plans Table -->
                      <div class="bg-white rounded-2xl shadow-lg overflow-hidden">
                        <div class="overflow-x-auto">
                        <table class="w-full min-w-[600px]">
                          <thead class="bg-gray-50 border-b-2 border-gray-200">
                            <tr>
                              <th class="text-left px-6 py-4 font-semibold text-gray-700">Plan Name</th>
                              <th class="text-left px-6 py-4 font-semibold text-gray-700">Premium</th>
                              <th class="text-left px-6 py-4 font-semibold text-gray-700">Coverage</th>
                              <th class="text-left px-6 py-4 font-semibold text-gray-700">Deductible</th>
                              <th class="text-left px-6 py-4 font-semibold text-gray-700">Status</th>
                              <th class="text-right px-6 py-4 font-semibold text-gray-700">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            @for (plan of plans(); track plan) {
                              <tr
                                class="border-b border-gray-100 hover:bg-gray-50 transition"
                                >
                                <td class="px-6 py-4">
                                  <div class="font-semibold text-gray-800">{{ plan.name }}</div>
                                </td>
                                <td class="px-6 py-4 font-semibold text-gray-800">\${{ plan.monthlyPremium }}/mo</td>
                                <td class="px-6 py-4 font-semibold text-gray-800">
                                  \${{ plan.coverageLimit.toLocaleString() }}
                                </td>
                                <td class="px-6 py-4 font-semibold text-gray-800">\${{ plan.deductible }}</td>
                                <td class="px-6 py-4">
                                  <span
                  [class]="
                    plan.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                  "
                                    class="px-3 py-1 rounded-full text-sm font-semibold"
                                    >
                                    {{ plan.isActive ? 'Active' : 'Inactive' }}
                                  </span>
                                </td>
                                <td class="px-6 py-4">
                                  <div class="flex items-center justify-end space-x-2">
                                    <button
                                      (click)="editPlan(plan)"
                                      class="text-blue-600 hover:text-blue-800 font-semibold"
                                      >
                                      Edit
                                    </button>
                                    <button
                                      (click)="togglePlanStatus(plan)"
                    [class]="
                      plan.isActive
                        ? 'text-red-600 hover:text-red-800'
                        : 'text-green-600 hover:text-green-800'
                    "
                                      class="font-semibold"
                                      >
                                      {{ plan.isActive ? 'Deactivate' : 'Activate' }}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            }
                          </tbody>
                        </table>
                        </div>
                      </div>
                    </div>
    `,
})
export class ManagePlansComponent implements OnInit {
  showCreateForm = signal(false);
  editingPlan = signal<InsurancePlan | null>(null);
  plans = signal<InsurancePlan[]>([]);
  planForm!: FormGroup;

  private fb = inject(FormBuilder);
  private planService = inject(PlanService);

  ngOnInit() {
    this.planForm = this.fb.group({
      name: ['', Validators.required],
      monthlyPremium: [null, [Validators.required, Validators.min(0)]],
      coverageLimit: [null, [Validators.required, Validators.min(0)]],
      deductible: [null, [Validators.required, Validators.min(0)]],
      description: [''],
      isActive: [true],
    });
    this.loadPlans();
  }

  loadPlans() {
    this.planService.getPlans().subscribe({
      next: (plans) => this.plans.set(plans),
      error: () => {
        this.plans.set([]);
      },
    });
  }

  editPlan(plan: InsurancePlan) {
    this.editingPlan.set(plan);
    this.planForm.reset({
      name: plan.name,
      monthlyPremium: plan.monthlyPremium,
      coverageLimit: plan.coverageLimit,
      deductible: plan.deductible,
      description: plan.description,
      isActive: plan.isActive,
    });
    this.showCreateForm.set(false);
  }

  cancelForm() {
    this.showCreateForm.set(false);
    this.editingPlan.set(null);
    this.planForm.reset({
      name: '',
      monthlyPremium: null,
      coverageLimit: null,
      deductible: null,
      description: '',
      isActive: true,
    });
  }

  savePlan() {
    if (this.planForm.invalid) {
      this.planForm.markAllAsTouched();
      return;
    }
    const formValue = this.planForm.value;
    if (this.editingPlan()) {
      this.planService.updatePlan(this.editingPlan()!.id, formValue).subscribe({
        next: (updatedPlan) => {
          // Replace the updated plan in the array
          this.plans.update((plans) =>
            plans.map((p) => (p.id === updatedPlan.id ? updatedPlan : p))
          );
          alert('Plan updated successfully!');
          this.cancelForm();
        },
        error: () => {
          alert('Failed to update plan.');
        },
      });
    } else {
      this.planService.createPlan(formValue).subscribe({
        next: (createdPlan) => {
          this.plans.update((plans) => [...plans, createdPlan]);
          alert('Plan created successfully!');
          this.cancelForm();
        },
        error: () => {
          alert('Failed to create plan.');
        },
      });
    }
  }

  togglePlanStatus(plan: InsurancePlan) {
    this.planService.updatePlanToggle(plan.id).subscribe({
      next: () => {
        plan.isActive = !plan.isActive;
        alert(`Plan ${plan.isActive ? 'activated' : 'deactivated'} successfully!`);
        this.loadPlans();
      },
      error: (e) => {
        alert('Failed to update plan status.');
        console.error('Error toggling plan status:', e);
      }
    });
  }
}
