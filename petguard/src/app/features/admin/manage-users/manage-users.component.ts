import { Component, computed, inject, signal } from '@angular/core';
import { UserService } from '@core/services/user.service';
import { User } from '@core/models/models';
import { rxResource } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-manage-users',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 class="text-xl md:text-2xl font-bold text-gray-800">Manage Users</h2>
          <p class="text-gray-600 text-sm">View and monitor registered system users</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Users List Table -->
        <div class="lg:col-span-2 bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <div class="overflow-x-auto">
            @if (usersResource.isLoading()) {
              <p class="p-6 text-gray-500 animate-pulse">Loading users...</p>
            } @else if (usersResource.error()) {
              <p class="p-6 text-red-500">Failed to load users.</p>
            } @else {
              <table class="w-full min-w-[500px]">
                <thead class="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th class="text-left px-6 py-4 font-semibold text-gray-700 text-sm">User</th>
                    <th class="text-left px-6 py-4 font-semibold text-gray-700 text-sm">Role</th>
                    <th class="text-left px-6 py-4 font-semibold text-gray-700 text-sm">Joined</th>
                    <th class="text-right px-6 py-4 font-semibold text-gray-700 text-sm">Action</th>
                  </tr>
                </thead>
                <tbody>
                  @for (user of users(); track user.id) {
                    <tr 
                      class="border-b border-gray-50 hover:bg-purple-50/20 transition cursor-pointer"
                      [class.bg-purple-50/40]="selectedUser()?.id === user.id"
                      (click)="selectUser(user)"
                    >
                      <td class="px-6 py-4">
                        <div class="font-bold text-gray-800">{{ user.fullName }}</div>
                        <div class="text-xs text-gray-500">{{ user.email }}</div>
                      </td>
                      <td class="px-6 py-4">
                        <span 
                          [class]="user.role === 'ADMIN' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'"
                          class="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider"
                        >
                          {{ user.role }}
                        </span>
                      </td>
                      <td class="px-6 py-4 text-sm text-gray-600">
                        {{ user.createdAt | date:'shortDate' }}
                      </td>
                      <td class="px-6 py-4 text-right">
                        <button 
                          class="text-purple-600 hover:text-purple-800 text-sm font-bold"
                          (click)="selectUser(user); $event.stopPropagation()"
                        >
                          Details →
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            }
          </div>
        </div>

        <!-- User Details Card -->
        <div class="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 h-fit space-y-6 max-h-[85vh] overflow-y-auto">
          <h3 class="text-lg font-bold text-gray-800 pb-3 border-b border-gray-100">User Details</h3>
          
          @if (selectedUser(); as user) {
            <div class="space-y-6 animate-slide-up">
              <div class="flex items-center space-x-3">
                <div class="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-xl font-bold">
                  {{ user.fullName.charAt(0) }}
                </div>
                <div>
                  <h4 class="font-bold text-gray-800 text-lg leading-tight">{{ user.fullName }}</h4>
                  <span class="text-xs text-gray-500 uppercase font-semibold tracking-wider">{{ user.role }}</span>
                </div>
              </div>

              <!-- Basic Fields -->
              <div class="grid grid-cols-2 gap-4 text-sm border-b border-gray-100 pb-5">
                <div>
                  <span class="text-gray-400 block text-xs uppercase font-bold tracking-wider">User ID</span>
                  <span class="text-gray-800 font-semibold">#{{ user.id }}</span>
                </div>
                <div>
                  <span class="text-gray-400 block text-xs uppercase font-bold tracking-wider">Joined</span>
                  <span class="text-gray-800 font-semibold">{{ user.createdAt | date:'shortDate' }}</span>
                </div>
                <div class="col-span-2">
                  <span class="text-gray-400 block text-xs uppercase font-bold tracking-wider">Email Address</span>
                  <span class="text-gray-800 font-semibold">{{ user.email }}</span>
                </div>
                <div class="col-span-2">
                  <span class="text-gray-400 block text-xs uppercase font-bold tracking-wider">Phone Number</span>
                  <span class="text-gray-800 font-semibold">{{ user.phone || 'N/A' }}</span>
                </div>
              </div>

              <!-- Pets & Policies -->
              <div>
                <h4 class="font-bold text-gray-800 text-xs uppercase tracking-wider mb-3">Pets & Policies</h4>
                
                @if (user.pets && user.pets.length > 0) {
                  <div class="space-y-4">
                    @for (pet of user.pets; track pet.id) {
                      <div class="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <div class="flex items-center justify-between mb-2">
                          <div>
                            <span class="font-bold text-gray-800">{{ pet.name }}</span>
                            <span class="text-[11px] text-gray-500 ml-2">({{ pet.species }} - {{ pet.breed }})</span>
                          </div>
                          <span 
                            [class]="pet.eligibilityStatus === 'ELIGIBLE' ? 'bg-green-100 text-green-700' : pet.eligibilityStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'"
                            class="px-2 py-0.5 rounded text-[10px] font-semibold"
                          >
                            {{ pet.eligibilityStatus }}
                          </span>
                        </div>

                        <!-- Policies nested in Pet -->
                        @if (pet.policies && pet.policies.length > 0) {
                          <div class="mt-2 pt-2 border-t border-gray-200/60 space-y-2">
                            @for (policy of pet.policies; track policy.id) {
                              <div class="flex items-center justify-between text-[11px]">
                                <div>
                                  <span class="font-semibold text-purple-700">{{ policy.planName }}</span>
                                  <span class="text-gray-500 ml-1">#{{ policy.id }}</span>
                                </div>
                                <span 
                                  [class]="policy.status === 'ACTIVE' ? 'text-green-600 font-bold' : 'text-gray-500'"
                                >
                                  {{ policy.status }}
                                </span>
                              </div>
                              <div class="text-[9px] text-gray-400">
                                Validity: {{ policy.startDate | date:'shortDate' }} to {{ policy.endDate | date:'shortDate' }}
                              </div>
                            }
                          </div>
                        } @else {
                          <p class="text-[11px] text-gray-400 italic mt-1">No active policies found.</p>
                        }
                      </div>
                    }
                  </div>
                } @else {
                  <p class="text-xs text-gray-500 italic py-2 text-center bg-gray-50 rounded-xl">No registered pets found.</p>
                }
              </div>
            </div>
          } @else {
            <div class="text-center py-12 text-gray-400">
              <span class="text-4xl block mb-2">👥</span>
              Select a user to view detailed information
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes slide-up {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-slide-up {
      animation: slide-up 0.3s ease-out;
    }
  `]
})
export class ManageUsersComponent {
  private userService = inject(UserService);

  usersResource = rxResource({
    stream: () => this.userService.getUsers()
  });

  users = computed(() => this.usersResource.value() || []);
  selectedUser = signal<User | null>(null);

  selectUser(user: User) {
    this.selectedUser.set(user);
  }
}
