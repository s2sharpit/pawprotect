import { HttpClient } from "@angular/common/http";
import { Policy } from '@core/models/models';
import { Observable } from "rxjs";
import { Injectable } from "@angular/core";
import { API_ENDPOINTS } from '@core/constants/api.endpoints';

@Injectable({
  providedIn: 'root'
})
export class PolicyService {

  constructor(private http: HttpClient) {}

  getPolicies(): Observable<Policy[]> {
    return this.http.get<Policy[]>(API_ENDPOINTS.POLICIES.BASE);
  }

  subscribeToPlan(petId: number, planId: number): Observable<Policy> {
    return this.http.post<Policy>(API_ENDPOINTS.POLICIES.BASE, { petId, planId });
  }

  cancelPolicy(id: number): Observable<void> {
    return this.http.put<void>(API_ENDPOINTS.POLICIES.cancel(id), {});
  }
}
