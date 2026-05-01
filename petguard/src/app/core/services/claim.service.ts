import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Claim } from '@core/models/models';
import { Observable } from "rxjs";
import { API_ENDPOINTS } from '@core/constants/api.endpoints';

@Injectable({
  providedIn: 'root'
})
export class ClaimService {

  constructor(private http: HttpClient) {}

  getClaims(): Observable<Claim[]> {
    return this.http.get<Claim[]>(API_ENDPOINTS.CLAIMS.BASE);
  }

  getClaimById(id: number): Observable<Claim> {
    return this.http.get<Claim>(API_ENDPOINTS.CLAIMS.byId(id));
  }

  submitClaim(claimData: FormData): Observable<Claim> {
    // FormData includes claim details + receipt file
    return this.http.post<Claim>(API_ENDPOINTS.CLAIMS.BASE, claimData);
  }

  reviewClaim(id: number, decision: any): Observable<Claim> {
    return this.http.put<Claim>(API_ENDPOINTS.CLAIMS.review(id), decision);
  }

  getAdminClaims(status?: string): Observable<Claim[]> {
    const url = status && status !== 'All' 
      ? `${API_ENDPOINTS.CLAIMS.ALL}?status=${status}` 
      : API_ENDPOINTS.CLAIMS.ALL;
    return this.http.get<Claim[]>(url);
  }

  adminReviewClaim(id: number, decision: { status: string; approvedAmount?: number; decisionReason: string }): Observable<Claim> {
    return this.http.post<Claim>(API_ENDPOINTS.CLAIMS.review(id), decision);
  }
}
