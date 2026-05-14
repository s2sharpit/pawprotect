import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { User } from '@core/models/models';
import { computed } from '@angular/core';

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null,
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => ({
    loginSuccess: (user: any) => {
      patchState(store, { user, error: null });
    },
    logout: () => {
      patchState(store, { user: null, error: null });
    },
    setLoading: (isLoading: boolean) => {
      patchState(store, { isLoading });
    },
    setError: (error: string) => {
      patchState(store, { error, isLoading: false });
    }
  })),
  withComputed((store) => ({
    isAuthenticated: computed(() => !!store.user()),
    isAdmin: computed(() => store.user()?.role === 'ADMIN')
  }))
);
