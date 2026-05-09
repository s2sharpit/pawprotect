
import { Component, signal, computed, effect, inject } from '@angular/core';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  NonNullableFormBuilder,
  FormGroup,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
// ...existing code...
import { AiService } from '@core/services/ai.service';
import { PetStore } from '@core/store/pet.store';

@Component({
  selector: 'app-add-pet',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  template: `
    <div class="max-w-3xl mx-auto">
      <div class="bg-white rounded-2xl shadow-lg p-8">
        <h2 class="text-3xl font-bold text-gray-800 mb-6">Add New Pet 🐾</h2>
    
        <!-- File Upload Only -->
        <div class="space-y-6">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Medical Records *</label>
            <div
              class="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-500 transition cursor-pointer"
              (click)="fileInput.click()"
              >
              <input
                #fileInput
                type="file"
                class="hidden"
                (change)="onFileSelect($event)"
                accept=".pdf,application/pdf"
                />
                @if (!selectedFile()) {
                  <div>
                    <span class="text-4xl mb-2 block">📄</span>
                    <p class="text-gray-600 mb-2">Click to upload medical records</p>
                    <p class="text-sm text-gray-500">PDF only (Max 10MB)</p>
                  </div>
                }
                @if (selectedFile()) {
                  <div class="text-purple-600">
                    <span class="text-4xl mb-2 block">✅</span>
                    <p class="font-semibold">{{ selectedFile()?.name }}</p>
                    <button
                      type="button"
                      (click)="removeFile($event)"
                      class="text-sm text-red-600 mt-2"
                      >
                      Remove
                    </button>
                  </div>
                }
              </div>
            </div>
    
            <!-- AI Processing State -->
            @if (isProcessing()) {
              <div class="mt-6 bg-purple-50 border-2 border-purple-200 rounded-xl p-8 text-center animate-pulse">
                <div class="text-6xl mb-4">🤖</div>
                <p class="text-xl font-semibold text-purple-600 mb-2">AI is analyzing medical records...</p>
                <p class="text-gray-600">This usually takes a few seconds</p>
                <div class="mt-4 flex items-center justify-center space-x-2">
                  <div class="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style="animation-delay: 0s"></div>
                  <div class="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                  <div class="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
                </div>
              </div>
            }
    
            <!-- Populated Fields -->
            @if (petForm()) {
              <form
                [formGroup]="petForm()!"
                (ngSubmit)="onSubmit()"
                class="space-y-6 animate-slide-down"
                >
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-xl font-bold text-gray-800">Pet Details extracted</h3>
                  <span class="bg-green-100 text-green-600 px-4 py-2 rounded-full font-semibold flex items-center">
                    <span class="mr-2">✓</span> AI Extraction Complete
                  </span>
                </div>

                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Pet Name</label>
                  <input type="text" formControlName="name" class="input-field" />
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Species</label>
                    <input type="text" formControlName="species" class="input-field" />
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Breed</label>
                    <input type="text" formControlName="breed" class="input-field" />
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Age (years)</label>
                    <input type="number" formControlName="age" class="input-field" />
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Gender</label>
                    <input type="text" formControlName="gender" class="input-field" />
                  </div>
                </div>
    
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Medical Summary</label>
                  <textarea formControlName="medicalSummary" class="input-field" rows="3"></textarea>
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Pre-existing Conditions</label>
                  <input
                    type="text"
                    formControlName="preExistingConditions"
                    class="input-field"
                    placeholder="e.g. Arthritis, Diabetes (comma separated)"
                  />
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Eligibility Status</label>
                    <input
                      type="text"
                      formControlName="eligibilityStatus"
                      class="input-field"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Eligibility Reason</label>
                    <input
                      type="text"
                      formControlName="eligibilityReason"
                      class="input-field"
                    />
                  </div>
                </div>
    
                <div class="flex space-x-4">
                  <button type="button" [routerLink]="['/dashboard/pets']" class="btn-secondary flex-1">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    [disabled]="!petForm()?.valid || isProcessing()"
                    class="btn-primary flex-1 disabled:opacity-50"
                    >
                    Add Pet
                  </button>
                </div>
              </form>
            }
          </div>
        </div>
      </div>
    `,
  styles: [`
    @keyframes slide-down {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-slide-down {
      animation: slide-down 0.5s ease-out;
    }
  `]
})
export class AddPet {
  selectedFile = signal<File | null>(null);
  isProcessing = signal(false);
  eligibilityResult = signal<any>(null);
  petForm = signal<FormGroup | null>(null);

  public petStore = inject(PetStore);

  constructor(
    private fb: NonNullableFormBuilder,
    private router: Router,
    private aiService: AiService
  ) { }

  onFileSelect(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.selectedFile.set(file);
      this.eligibilityResult.set(null);
      this.petForm.set(null);
      this.checkEligibility();
    }
  }

  removeFile(event: Event) {
    event.stopPropagation();
    this.selectedFile.set(null);
    this.eligibilityResult.set(null);
    this.petForm.set(null);
  }

  checkEligibility() {
    const file = this.selectedFile();
    if (!file) return;
    this.isProcessing.set(true);
    this.aiService.checkEligibility(file).subscribe({
      next: (res) => {
        this.isProcessing.set(false);
        // Always store as array for form value
        let preExistingConditions: string[] = [];
        if (Array.isArray(res.preExistingConditions)) {
          preExistingConditions = res.preExistingConditions;
        } else if (
          typeof res.preExistingConditions === 'string' &&
          res.preExistingConditions.length > 0
        ) {
          preExistingConditions = res.preExistingConditions
            .split(',')
            .map((s: string) => s.trim())
            .filter((s: string) => s.length > 0);
        }
        this.petForm.set(
          this.fb.group({
            name: [res.name || '', Validators.required],
            species: [res.species || '', Validators.required],
            breed: [res.breed || '', Validators.required],
            age: [res.age || '', [Validators.required, Validators.min(0)]],
            gender: [res.gender || '', Validators.required],
            medicalSummary: [res.medicalSummary || ''],
            preExistingConditions: [preExistingConditions.join(', ')],
            eligibilityStatus: [res.eligibilityStatus || ''],
            eligibilityReason: [res.eligibilityReason || ''],
            eligibilityCheckedAt: [new Date().toISOString()],
          })
        );
        this.eligibilityResult.set({
          status: res.eligibilityStatus || '',
          reason: res.eligibilityReason || '',
        });
      },
      error: (e) => {
        this.isProcessing.set(false);
        this.eligibilityResult.set({
          status: 'ERROR',
          reason: 'Failed to analyze medical records.',
        });
      },
    });
  }

  onSubmit() {
    const form = this.petForm();
    if (form && form.valid) {
      // Always send preExistingConditions as array
      const payload = { ...form.value };
      if (!Array.isArray(payload.preExistingConditions)) {
        if (typeof payload.preExistingConditions === 'string') {
          payload.preExistingConditions = payload.preExistingConditions
            .split(',')
            .map((s: string) => s.trim())
            .filter((s: string) => s.length > 0);
        } else {
          payload.preExistingConditions = [];
        }
      }
      this.petStore.addPet({
        petData: payload,
        onSuccess: () => this.router.navigate(['/dashboard/pets'])
      });
    }
  }
}
