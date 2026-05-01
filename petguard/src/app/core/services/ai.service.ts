import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '@core/constants/api.endpoints';

@Injectable({
  providedIn: 'root',
})
export class AiService {

  constructor(private http: HttpClient) {}

  sendMessage(message: string, petId?: number): Observable<{ response: string }> {
    const payload: any = { message };
    if (petId !== undefined && petId !== null) {
      payload.petId = petId;
    }
    return this.http.post<{ response: string }>(API_ENDPOINTS.AI.CHAT, payload);
  }

  checkEligibility(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    console.log(file);

    return this.http.post<any>(API_ENDPOINTS.AI.CHECK_ELIGIBILITY, formData);
  }
}
