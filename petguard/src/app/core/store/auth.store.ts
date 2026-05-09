import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { User } from '@core/models/models';
import { inject, PLATFORM_ID, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, platformId = inject(PLATFORM_ID)) => ({
    loadFromStorage: () => {
      if (isPlatformBrowser(platformId)) {
        const token = localStorage.getItem('token');
        const userJson = localStorage.getItem('user');
        if (token && userJson) {
          try {
            const user = JSON.parse(userJson);
            patchState(store, { user, token });
          } catch (e) {
            console.error('Error parsing user from localStorage', e);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        }
      }
    },
    loginSuccess: (response: any) => {
      if (isPlatformBrowser(platformId)) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response));
      }
      patchState(store, { user: response, token: response.token, error: null });
    },
    logout: () => {
      if (isPlatformBrowser(platformId)) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      patchState(store, { user: null, token: null, error: null });
    },
    setLoading: (isLoading: boolean) => {
      patchState(store, { isLoading });
    },
    setError: (error: string) => {
      patchState(store, { error, isLoading: false });
    }
  })),
  withComputed((store, platformId = inject(PLATFORM_ID)) => ({
    isAuthenticated: computed(() => {
      if (!isPlatformBrowser(platformId)) {
        return false;
      }
      return !!store.token() || !!localStorage.getItem('token');
    }),
    isAdmin: computed(() => store.user()?.role === 'ADMIN')
  }))
);
