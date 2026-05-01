import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PetService } from '@core/services/pet.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-my-pets',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-gray-800">My Pets</h2>
          <p class="text-gray-600">Manage your furry friends</p>
        </div>
        <button [routerLink]="['/dashboard/pets/add']" class="btn-primary flex items-center space-x-2">
          <span>➕</span><span>Add New Pet</span>
        </button>
      </div>

      <!-- Loading (resource.loading()) -->
      @if (petsResource.isLoading()) {
        <div class="bg-white rounded-2xl shadow-lg p-12 text-center">
          <div class="text-6xl mb-4">⏳</div>
          <p class="text-gray-600">Loading pets...</p>
        </div>
      }

      <!-- Error (resource.error()) -->
      @if (petsResource.error(); as error) {
        <div class="bg-red-50 rounded-2xl shadow-lg p-6 text-center">
          <div class="text-4xl mb-2">❌</div>
          <p class="text-red-600 mb-4">{{ error.message || 'Failed to load pets' }}</p>
          <button (click)="petsResource.reload()" class="btn-primary">Try Again</button>
        </div>
      }

      <!-- Pets Grid (resource.value()) -->
      @if (petsResource.hasValue() && petsResource.value().length > 0) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (pet of petsResource.value(); track pet.id) {
            <div class="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden">
              <div class="bg-linear-to-br from-purple-400 to-pink-400 h-40 flex items-center justify-center">
                <span class="text-7xl">{{ getPetEmoji(pet.species | titlecase) }}</span>
              </div>
              <div class="p-6">
                <div class="flex items-start justify-between mb-4">
                  <div>
                    <h3 class="text-2xl font-bold text-gray-800">{{ pet.name }}</h3>
                    <p class="text-gray-600">{{ pet.breed }}</p>
                  </div>
                  <span [class]="getStatusBadge(pet.eligibilityStatus)">{{ pet.eligibilityStatus }}</span>
                </div>
                <div class="space-y-2 mb-4">
                  <div class="flex items-center text-gray-600">
                    <span class="w-20 font-semibold">Age:</span><span>{{ pet.age }} years</span>
                  </div>
                  <div class="flex items-center text-gray-600">
                    <span class="w-20 font-semibold">Gender:</span><span>{{ pet.gender }}</span>
                  </div>
                  <div class="flex items-center text-gray-600">
                    <span class="w-20 font-semibold">Species:</span><span>{{ pet.species }}</span>
                  </div>
                </div>
                <div class="flex space-x-2">
                  <button 
                    [routerLink]="[pet.id]"
                    class="flex-1 bg-purple-50 text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-purple-100 transition"
                  >
                    View Details
                  </button>
                  <button 
                    (click)="deletePet(pet.id, pet.name)"
                    class="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-semibold hover:bg-red-100 transition"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          }
        </div>
      } @else {
        <!-- No Pets (success but empty) -->
        <div class="bg-white rounded-2xl shadow-lg p-12 text-center">
          <div class="text-6xl mb-4">🐾</div>
          <h3 class="text-2xl font-bold text-gray-800 mb-2">No pets yet</h3>
          <p class="text-gray-600 mb-6">Add your first pet to get started</p>
          <button [routerLink]="['/dashboard/pets/add']" class="btn-primary">Add Your First Pet</button>
        </div>
      }
    </div>
  `,
})
export class MyPetsComponent {
  private petService = inject(PetService);
  private snackBar = inject(MatSnackBar);

  // ONE LINE replaces: pets, isLoading, errorMessage, hasError, hasPets, ngOnInit, loadPets subscribe!
  petsResource = rxResource({
    stream: () => this.petService.getPets(),
  });

  getPetEmoji(species: string): string {
    const emojis: Record<string, string> = {
      Dog: '🐕', Cat: '🐈', Bird: '🦜', Rabbit: '🐰', Hamster: '🐹',
    };
    return emojis[species] || '🐾';
  }

  getStatusBadge(status: string): string {
    const badges: Record<string, string> = {
      ELIGIBLE: 'bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm font-semibold',
      NOT_ELIGIBLE: 'bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-semibold',
      PENDING: 'bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full text-sm font-semibold',
    };
    return badges[status] || '';
  }

  async deletePet(id: number, name: string) {
    if (!confirm(`Are you sure you want to remove ${name}? This action cannot be undone.`)) {
      return;
    }

    try {
      await firstValueFrom(this.petService.deletePet(id));
      this.snackBar.open(`${name} has been removed successfully.`, 'Ok', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
      // Refresh the resource
      this.petsResource.reload();
    } catch (error: any) {
      this.snackBar.open(
        error.error?.message || `Failed to delete ${name}.`,
        'Dismiss',
        { duration: 5000, panelClass: ['error-snackbar'] }
      );
    }
  }
}
