import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

import { Router, RouterModule } from '@angular/router';
import { PolicyService } from '@core/services/policy.service';
import { ClaimService } from '@core/services/claim.service';
import { Policy } from '@core/models/models';

@Component({
  selector: 'app-submit-claim',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  template: `
    <div class="max-w-4xl mx-auto space-y-6">
      <!-- Header -->
      <div class="bg-white rounded-2xl shadow-lg p-8">
        <h2 class="text-3xl font-bold text-gray-800 mb-2">Submit Insurance Claim 📄</h2>
        <p class="text-gray-600">Upload your vet receipt and AI will extract the details automatically</p>
      </div>
    
      <form [formGroup]="claimForm" (ngSubmit)="onSubmit()">
        <!-- Select Policy -->
        <div class="bg-white rounded-2xl shadow-lg p-8">
          <h3 class="text-xl font-bold text-gray-800 mb-4">Select Policy</h3>
          <select formControlName="policyId" class="input-field">
            <option value="">Choose a policy...</option>
            @for (policy of policies; track policy) {
              <option [value]="policy.id">
                {{ policy.petName }} - {{ policy.planName }}
              </option>
            }
          </select>
        </div>
    
        <!-- Upload Receipt -->
        <div class="bg-white rounded-2xl shadow-lg p-8">
          <h3 class="text-xl font-bold text-gray-800 mb-4">Upload Vet Receipt</h3>
    
          <div class="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-purple-500 transition cursor-pointer"
            (click)="fileInput.click()">
            <input #fileInput
              type="file"
              class="hidden"
              (change)="onFileSelect($event)"
              accept=".pdf,.jpg,.jpeg,.png">
    
              @if (!receiptFile) {
                <div>
                  <div class="text-6xl mb-4">📄</div>
                  <p class="text-xl font-semibold text-gray-800 mb-2">Click to upload receipt</p>
                  <p class="text-gray-600 mb-4">or drag and drop</p>
                  <p class="text-sm text-gray-500">PDF, JPG, PNG up to 10MB</p>
                </div>
              }
    
              @if (receiptFile && !extractedData) {
                <div>
                  <div class="text-6xl mb-4">✅</div>
                  <p class="text-xl font-semibold text-purple-600 mb-2">{{ receiptFile.name }}</p>
                  <button type="button"
                    (click)="removeFile($event)"
                    class="text-red-600 hover:text-red-800 font-semibold">
                    Remove
                  </button>
                </div>
              }
            </div>
    
            <!-- AI Processing State -->
            @if (isProcessingOCR) {
              <div
                class="mt-6 bg-purple-50 border-2 border-purple-200 rounded-xl p-8 text-center animate-pulse">
                <div class="text-6xl mb-4">🤖</div>
                <p class="text-xl font-semibold text-purple-600 mb-2">AI is extracting receipt details...</p>
                <p class="text-gray-600">This usually takes 3-5 seconds</p>
                <div class="mt-4 flex items-center justify-center space-x-2">
                  <div class="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style="animation-delay: 0s"></div>
                  <div class="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                  <div class="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
                </div>
              </div>
            }
          </div>
    
          <!-- Extracted Data (Editable) -->
          @if (extractedData) {
            <div class="bg-white rounded-2xl shadow-lg p-8 space-y-6 animate-slide-down">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-xl font-bold text-gray-800">Extracted Information</h3>
                <span class="bg-green-100 text-green-600 px-4 py-2 rounded-full font-semibold flex items-center">
                  <span class="mr-2">✓</span> AI Extraction Complete
                </span>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Treatment Date -->
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Treatment Date</label>
                  <input
                    type="date"
                    formControlName="treatmentDate"
                    class="input-field">
                  </div>
                  <!-- Vet Clinic -->
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Vet Clinic Name</label>
                    <input
                      type="text"
                      formControlName="vetClinicName"
                      class="input-field"
                      placeholder="Happy Paws Veterinary">
                    </div>
                    <!-- Treatment Type -->
                    <div>
                      <label class="block text-sm font-semibold text-gray-700 mb-2">Treatment Type</label>
                      <select formControlName="treatmentType" class="input-field">
                        <option value="Vaccination">Vaccination</option>
                        <option value="Surgery">Surgery</option>
                        <option value="Checkup">Routine Checkup</option>
                        <option value="Emergency">Emergency Care</option>
                        <option value="Dental">Dental Care</option>
                        <option value="Medication">Medication</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <!-- Claim Amount -->
                    <div>
                      <label class="block text-sm font-semibold text-gray-700 mb-2">Total Amount</label>
                      <div class="relative">
                        <span class="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600">$</span>
                        <input
                          type="number"
                          formControlName="claimAmount"
                          class="input-field pl-8"
                          placeholder="0.00">
                        </div>
                      </div>
                    </div>
                    <!-- Diagnosis -->
                    <div>
                      <label class="block text-sm font-semibold text-gray-700 mb-2">Diagnosis</label>
                      <textarea
                        formControlName="diagnosis"
                        rows="3"
                        class="input-field resize-none"
                      placeholder="Enter diagnosis from vet receipt..."></textarea>
                    </div>
                    <!-- Medications -->
                    <div>
                      <label class="block text-sm font-semibold text-gray-700 mb-2">Medications (if any)</label>
                      <textarea
                        formControlName="medications"
                        rows="2"
                        class="input-field resize-none"
                      placeholder="List medications prescribed..."></textarea>
                    </div>
                    <!-- AI Confidence Score -->
                    <div class="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                      <div class="flex items-center justify-between mb-2">
                        <span class="font-semibold text-blue-900">AI Extraction Confidence</span>
                        <span class="text-2xl font-bold text-blue-600">{{ extractedData.confidence }}%</span>
                      </div>
                      <div class="h-2 bg-blue-200 rounded-full overflow-hidden">
                        <div [style.width.%]="extractedData.confidence"
                        class="h-full bg-blue-500 transition-all duration-500"></div>
                      </div>
                      <p class="text-sm text-blue-700 mt-2">
                        Please review and correct any information if needed before submitting
                      </p>
                    </div>
                  </div>
                }
    
                <!-- Submit Buttons -->
                <div class="bg-white rounded-2xl shadow-lg p-8">
                  <div class="flex space-x-4">
                    <button
                      type="button"
                      [routerLink]="['/dashboard/claims']"
                      class="btn-secondary flex-1">
                      Cancel
                    </button>
                    <button
                      type="submit"
                      [disabled]="!extractedData || claimForm.invalid || isSubmitting"
                      class="btn-primary flex-1 disabled:opacity-50">
                      @if (!isSubmitting) {
                        <span>Submit Claim</span>
                      }
                      @if (isSubmitting) {
                        <span class="flex items-center justify-center">
                          <svg class="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Submitting...
                        </span>
                      }
                    </button>
                  </div>
                </div>
              </form>
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
export class SubmitClaimComponent implements OnInit {
  claimForm!: FormGroup;
  receiptFile: File | null = null;
  isProcessingOCR = false;
  extractedData: any = null;
  isSubmitting = false;
  policies: Policy[] = [];
  loadingPolicies = false;
  error: string | null = null;

  private policyService = inject(PolicyService);
  private claimService = inject(ClaimService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  ngOnInit(): void {
    this.claimForm = this.fb.group({
      policyId: ['', Validators.required],
      treatmentDate: ['', Validators.required],
      vetClinicName: ['', Validators.required],
      diagnosis: ['', Validators.required],
      treatmentType: ['', Validators.required],
      medications: [''],
      claimAmount: ['', [Validators.required, Validators.min(0)]]
    });
    this.fetchPolicies();
  }

  fetchPolicies() {
    this.loadingPolicies = true;
    this.policyService.getPolicies().subscribe({
      next: (data) => {
        this.policies = data;
        this.loadingPolicies = false;
      },
      error: (err) => {
        this.error = 'Failed to load policies.';
        this.loadingPolicies = false;
      }
    });
  }

  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.receiptFile = file;
      this.processReceiptWithOCR();
    }
  }

  removeFile(event: Event) {
    event.stopPropagation();
    this.receiptFile = null;
    this.extractedData = null;
    this.claimForm.reset();
  }

  processReceiptWithOCR() {
    this.isProcessingOCR = true;

    // Simulate AI OCR processing
    setTimeout(() => {
      this.isProcessingOCR = false;

      // Mock extracted data
      this.extractedData = {
        confidence: 95,
        treatmentDate: '2024-12-20',
        vetClinicName: 'Happy Paws Veterinary Clinic',
        diagnosis: 'Annual vaccination and health checkup',
        treatmentType: 'Vaccination',
        medications: 'Rabies vaccine, DHPP vaccine',
        claimAmount: 450.00
      };

      // Populate form with extracted data
      this.claimForm.patchValue(this.extractedData);
    }, 3000);
  }

  onSubmit() {
    if (this.claimForm.valid && this.receiptFile) {
      this.isSubmitting = true;
      const formData = new FormData();
      formData.append('policyId', this.claimForm.value.policyId);
      formData.append('treatmentDate', this.claimForm.value.treatmentDate);
      formData.append('vetClinicName', this.claimForm.value.vetClinicName);
      formData.append('diagnosis', this.claimForm.value.diagnosis);
      formData.append('treatmentType', this.claimForm.value.treatmentType);
      formData.append('medications', this.claimForm.value.medications || '');
      formData.append('claimAmount', this.claimForm.value.claimAmount);
      formData.append('receipt', this.receiptFile);

      this.claimService.submitClaim(formData).subscribe({
        next: () => {
          this.isSubmitting = false;
          alert('Claim submitted successfully! 🎉');
          this.router.navigate(['/dashboard/claims']);
        },
        error: () => {
          this.isSubmitting = false;
          alert('Failed to submit claim. Please try again.');
        }
      });
    }
  }
}
