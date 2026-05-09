import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { Pet } from '@core/models/models';
import { inject } from '@angular/core';
import { PetService } from '@core/services/pet.service';
import { tapResponse } from '@ngrx/operators';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, tap, switchMap } from 'rxjs';

export interface PetState {
  pets: Pet[];
  isLoading: boolean;
  error: string | null;
}

const initialState: PetState = {
  pets: [],
  isLoading: false,
  error: null,
};

export const PetStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, petService = inject(PetService)) => ({
    loadPets: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(() => {
          return petService.getPets().pipe(
            tapResponse({
              next: (pets) => patchState(store, { pets, isLoading: false }),
              error: (err: any) => patchState(store, { error: err.message || 'Failed to load pets', isLoading: false }),
            })
          );
        })
      )
    ),
    addPet: rxMethod<{ petData: Partial<Pet>; onSuccess?: () => void }>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(({ petData, onSuccess }) => petService.addPet(petData).pipe(
          tapResponse({
            next: (newPet) => {
              patchState(store, { pets: [...store.pets(), newPet], isLoading: false });
              if (onSuccess) onSuccess();
            },
            error: (err: any) => patchState(store, { error: err.message || 'Failed to add pet', isLoading: false }),
          })
        ))
      )
    ),
    updatePet: rxMethod<{ id: number; petData: Partial<Pet>; onSuccess?: () => void }>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(({ id, petData, onSuccess }) => petService.updatePet(id, petData).pipe(
          tapResponse({
            next: (updatedPet) => {
              patchState(store, {
                pets: store.pets().map(p => p.id === updatedPet.id ? updatedPet : p),
                isLoading: false
              });
              if (onSuccess) onSuccess();
            },
            error: (err: any) => patchState(store, { error: err.message || 'Failed to update pet', isLoading: false }),
          })
        ))
      )
    ),
    deletePet: rxMethod<number>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((id) => petService.deletePet(id).pipe(
          tapResponse({
            next: () => patchState(store, {
              pets: store.pets().filter(p => p.id !== id),
              isLoading: false
            }),
            error: (err: any) => patchState(store, { error: err.message || 'Failed to delete pet', isLoading: false }),
          })
        ))
      )
    ),
  }))
);
