import { HttpClient } from "@angular/common/http";
import { Pet } from '@core/models/models';
import { Observable } from "rxjs";
import { Injectable } from "@angular/core";
import { API_ENDPOINTS } from '@core/constants/api.endpoints';

@Injectable({
  providedIn: 'root'
})
export class PetService {

  constructor(private http: HttpClient) {}

  getPets(): Observable<Pet[]> {
    return this.http.get<Pet[]>(API_ENDPOINTS.PETS.BASE);
  }

  getPetById(id: number): Observable<Pet> {
    return this.http.get<Pet>(API_ENDPOINTS.PETS.byId(id));
  }

  addPet(petData: Partial<Pet>): Observable<Pet> {
    console.log(petData);

    return this.http.post<Pet>(API_ENDPOINTS.PETS.BASE, petData);
  }

  updatePet(id: number, petData: Partial<Pet>): Observable<Pet> {
    return this.http.put<Pet>(API_ENDPOINTS.PETS.byId(id), petData);
  }

  deletePet(id: number): Observable<void> {
    return this.http.delete<void>(API_ENDPOINTS.PETS.byId(id));
  }
}
