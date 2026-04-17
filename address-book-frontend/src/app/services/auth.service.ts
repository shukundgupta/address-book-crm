import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  API = 'http://localhost:3000/api/auth';

  constructor(private http: HttpClient) {}

  login(data: any) {
    return this.http.post(`${this.API}/login`, data);
  }

  saveToken(token: string) {
    localStorage.setItem('token', token);
  }

  saveUser(user: any) {
  localStorage.setItem('user', JSON.stringify(user));
}

getUser() {
  return JSON.parse(localStorage.getItem('user') || '{}');
}

  getToken() {
    return localStorage.getItem('token');
  }

  logout() {
    localStorage.removeItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

}