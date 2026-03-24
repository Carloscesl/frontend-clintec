import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:8080/auth';

  currentUser = signal<User | null>(null);

  login(credentials: any): Observable<User> {
    return this.http
      .post<User>(`${this.API_URL}/login`, credentials)
      .pipe(tap((user) => this.setSession(user)));
  }

  register(userData: any): Observable<User> {
    return this.http
      .post<User>(`${this.API_URL}/register`, userData)
      .pipe(tap((user) => this.setSession(user)));
  }

  private setSession(user: User) {
    localStorage.setItem('clintec_token', user.token);
    this.currentUser.set(user);
  }

  logout() {
    localStorage.removeItem('clintec_token');
    this.currentUser.set(null);
  }
}
