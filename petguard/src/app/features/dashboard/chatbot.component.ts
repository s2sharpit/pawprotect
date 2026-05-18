import { Component, Output, EventEmitter, signal, inject } from '@angular/core';
import { AiService } from '@core/services/ai.service';
import { PetStore } from '@core/store/pet.store';
import { Pet } from '@core/models/models';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div
      class="fixed bottom-24 right-0 md:right-6 w-full md:w-96 bg-white md:rounded-2xl rounded-t-2xl shadow-2xl z-50 flex flex-col animate-slide-up"
      style="height: 500px;"
      >
      <div
        class="bg-linear-to-r from-purple-500 to-pink-500 p-4 rounded-t-2xl flex items-center justify-between"
        >
        <h3 class="text-white font-bold text-lg">🐾 AI Health Assistant</h3>
        <button (click)="close.emit()" class="text-white hover:text-white/80">
          <span class="text-xl">✕</span>
        </button>
      </div>
    
      <div class="p-4 border-b">
        <label class="block text-sm font-medium mb-1">Select Pet for Context:</label>
        <select
          [ngModel]="petId()"
          (ngModelChange)="petId.set($event)"
          class="w-full px-3 py-2 rounded-lg border border-purple-200 focus:border-purple-500 outline-none"
          >
          <option [ngValue]="undefined">-- No Pet Selected --</option>
          @for (pet of petStore.pets(); track pet) {
            <option [ngValue]="pet.id">
              {{ pet.name }} ({{ pet.species }})
            </option>
          }
        </select>
      </div>
      <div class="flex-1 overflow-y-auto p-4 space-y-4">
        @for (msg of chatMessages(); track msg) {
          <div [ngClass]="msg.isUser ? 'text-right' : 'text-left'">
            <div
              [ngClass]="msg.isUser ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-800'"
              class="inline-block px-4 py-2 rounded-2xl max-w-[80%]"
              >
              {{ msg.text }}
            </div>
          </div>
        }
        @if (loading()) {
          <div class="flex justify-center mt-4">
            <span
              class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-300 border-t-purple-600"
            ></span>
            <span class="ml-2 text-purple-600 font-medium">Thinking...</span>
          </div>
        }
      </div>
    
      <div class="p-4 border-t">
        <div class="flex space-x-2">
          <input
            [ngModel]="chatInput()"
            (ngModelChange)="chatInput.set($event)"
            (keyup.enter)="sendMessage()"
            type="text"
            class="flex-1 px-4 py-2 rounded-full border-2 border-purple-200 focus:border-purple-500 outline-none"
            placeholder="Describe symptoms..."
            [disabled]="loading()"
            />
            <button
              (click)="sendMessage()"
              class="bg-purple-500 text-white px-4 py-2 rounded-full hover:bg-purple-600 transition"
              [disabled]="loading()"
              >
              @if (loading()) {
                <span>...</span>
              } @else {
                <span>Send</span>
              }
            </button>
          </div>
        </div>
      </div>
    `,
  styles: [
    `
      @keyframes slide-up {
        from {
          opacity: 0;
          transform: translateY(50px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .animate-slide-up {
        animation: slide-up 0.3s ease-out;
      }
    `,
  ],
})
export class ChatbotComponent {
  @Output() close = new EventEmitter<void>();

  petId = signal<number | undefined>(undefined);
  chatMessages = signal<{ text: string; isUser: boolean }[]>([
    { text: "Hello! I'm your AI pet health assistant. How can I help you today?", isUser: false },
  ]);
  chatInput = signal<string>('');
  loading = signal<boolean>(false);

  private aiService = inject(AiService);
  public petStore = inject(PetStore);

  constructor() {
    if (this.petStore.pets().length === 0) {
      this.petStore.loadPets();
    }
  }

  sendMessage() {
    const input = this.chatInput().trim();
    if (!input) return;
    this.chatMessages.update((msgs) => [...msgs, { text: input, isUser: true }]);
    this.chatInput.set('');
    this.loading.set(true);
    this.aiService.sendMessage(input, this.petId()).subscribe({
      next: (res) => {
        this.chatMessages.update((msgs) => [...msgs, { text: res.response, isUser: false }]);
        this.loading.set(false);
        console.log(res);
      },
      error: () => {
        this.chatMessages.update((msgs) => [
          ...msgs,
          { text: 'Sorry, there was a problem contacting the AI assistant.', isUser: false },
        ]);
        this.loading.set(false);
      },
    });
  }
}
