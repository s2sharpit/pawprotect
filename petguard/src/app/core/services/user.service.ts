import { HttpClient } from "@angular/common/http";
import { User } from '@core/models/models';
import { Observable } from "rxjs";
import { Injectable } from "@angular/core";
import { API_ENDPOINTS } from '@core/constants/api.endpoints';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(API_ENDPOINTS.USERS.BASE);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(API_ENDPOINTS.USERS.byId(id));
  }
}
