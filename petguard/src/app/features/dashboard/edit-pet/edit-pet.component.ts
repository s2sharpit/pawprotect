import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  FormGroup,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PetService } from '@core/services/pet.service';
import { PetStore } from '@core/store/pet.store';
import { rxResource } from '@angular/core/rxjs-interop';
import { map, switchMap, tap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Pet } from '@core/models/models';

@Component({
  selector: 'app-edit-pet',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, CommonModule],
  template: `
    <div class="max-w-3xl mx-auto">
      <div class="bg-white rounded-3xl shadow-xl p-10 border border-gray-100">
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-3xl font-black text-gray-800">Edit Pet Details 🐾</h2>
          <button [routerLink]="['/dashboard/pets', petId()]" class="text-gray-500 hover:text-purple-600 font-bold transition">
            Cancel
          </button>
        </div>
    
        @if (petResource.isLoading()) {
          <div class="py-20 text-center animate-pulse">
            <div class="text-6xl mb-4">⌛</div>
            <p class="text-gray-500 font-bold">Loading pet info...</p>
          </div>
        }

        @if (petForm) {
          <form
            [formGroup]="petForm"
            (ngSubmit)="onSubmit()"
            class="space-y-6 animate-slide-up"
            >
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Pet Name</label>
                <input type="text" formControlName="name" class="input-field" />
              </div>
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Species</label>
                <input type="text" formControlName="species" class="input-field" />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-bold text-gray-700 mb-2">Breed</label>
                <input type="text" formControlName="breed" class="input-field" />
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-bold text-gray-700 mb-2">Age (years)</label>
                  <input type="number" formControlName="age" class="input-field" />
                </div>
                <div>
                  <label class="block text-sm font-bold text-gray-700 mb-2">Gender</label>
                  <input type="text" formControlName="gender" class="input-field" />
                </div>
              </div>
            </div>

            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Medical Summary</label>
              <textarea formControlName="medicalSummary" class="input-field" rows="4"></textarea>
            </div>

            <div>
              <label class="block text-sm font-bold text-gray-700 mb-2">Pre-existing Conditions</label>
              <input
                type="text"
                formControlName="preExistingConditions"
                class="input-field"
                placeholder="e.g. Arthritis, Diabetes (comma separated)"
              />
              <p class="text-xs text-gray-400 mt-2 font-medium italic">Separate multiple conditions with commas</p>
            </div>

            <div class="bg-gray-50 rounded-2xl p-6 border border-gray-100 space-y-4">
               <h4 class="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Eligibility Control</h4>
               <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-bold text-gray-500 mb-1">Status</label>
                    <select formControlName="eligibilityStatus" class="input-field py-2">
                       <option value="ELIGIBLE">ELIGIBLE</option>
                       <option value="NOT_ELIGIBLE">NOT_ELIGIBLE</option>
                       <option value="PENDING">PENDING</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-xs font-bold text-gray-500 mb-1">Reason</label>
                    <input type="text" formControlName="eligibilityReason" class="input-field py-2" />
                  </div>
               </div>
            </div>

            <div class="flex space-x-4 pt-4">
              <button
                type="submit"
                [disabled]="petForm.invalid || isSubmitting()"
                class="btn-primary flex-1 py-4 text-lg shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                >
                {{ isSubmitting() ? 'Saving Changes...' : 'Save Updates 💾' }}
              </button>
            </div>
          </form>
        }
      </div>
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
export class EditPetComponent {
  private fb = inject(FormBuilder);
  private petService = inject(PetService);
  private petStore = inject(PetStore);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isSubmitting = signal(false);
  petId = signal<number>(0);
  petForm!: FormGroup;

  petResource = rxResource<Pet, any>({
    stream: () => this.route.params.pipe(
      map(params => {
        const id = +params['id'];
        this.petId.set(id);
        return id;
      }),
      switchMap(id => this.petService.getPetById(id).pipe(
        tap(pet => this.initForm(pet))
      ))
    )
  });

  private initForm(pet: any) {
    const preExistingConditions = Array.isArray(pet.preExistingConditions)
      ? pet.preExistingConditions.join(', ')
      : pet.preExistingConditions || '';

    this.petForm = this.fb.group({
      name: [pet.name || '', Validators.required],
      species: [pet.species || '', Validators.required],
      breed: [pet.breed || '', Validators.required],
      age: [pet.age || '', [Validators.required, Validators.min(0)]],
      gender: [pet.gender || '', Validators.required],
      medicalSummary: [pet.medicalSummary || ''],
      preExistingConditions: [preExistingConditions],
      eligibilityStatus: [pet.eligibilityStatus || 'PENDING'],
      eligibilityReason: [pet.eligibilityReason || ''],
    });
  }

  onSubmit() {
    if (this.petForm.valid) {
      this.isSubmitting.set(true);
      const payload = { ...this.petForm.value };
      
      // Convert comma string back to array
      if (typeof payload.preExistingConditions === 'string') {
        payload.preExistingConditions = payload.preExistingConditions
          .split(',')
          .map((s: string) => s.trim())
          .filter((s: string) => s.length > 0);
      } else if (!Array.isArray(payload.preExistingConditions)) {
        payload.preExistingConditions = [];
      }

      this.petStore.updatePet({
        id: this.petId(),
        petData: payload,
        onSuccess: () => {
          this.isSubmitting.set(false);
          this.router.navigate(['/dashboard/pets', this.petId()]);
        }
      });
    }
  }
}
