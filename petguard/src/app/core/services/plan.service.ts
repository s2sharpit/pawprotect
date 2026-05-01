import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { InsurancePlan } from '@core/models/models';
import { Observable } from "rxjs";
import { API_ENDPOINTS } from '@core/constants/api.endpoints';

@Injectable({
  providedIn: 'root'
})
export class PlanService {

  constructor(private http: HttpClient) {}

  getPlans(): Observable<InsurancePlan[]> {
    return this.http.get<InsurancePlan[]>(`${API_ENDPOINTS.PLANS.BASE}?includeInactive=true`);
  }

  getActivePlans(): Observable<InsurancePlan[]> {
    return this.http.get<InsurancePlan[]>(API_ENDPOINTS.PLANS.BASE);
  }

  getPlanById(id: number): Observable<InsurancePlan> {
    return this.http.get<InsurancePlan>(API_ENDPOINTS.PLANS.byId(id));
  }

  createPlan(planData: Partial<InsurancePlan>): Observable<InsurancePlan> {
    return this.http.post<InsurancePlan>(API_ENDPOINTS.PLANS.BASE, planData);
  }

  updatePlan(id: number, planData: Partial<InsurancePlan>): Observable<InsurancePlan> {
    return this.http.put<InsurancePlan>(API_ENDPOINTS.PLANS.byId(id), planData);
  }

  updatePlanToggle(id: number): Observable<InsurancePlan> {
    return this.http.patch<InsurancePlan>(API_ENDPOINTS.PLANS.status(id), {});
  }
}
