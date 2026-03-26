import { Injectable, signal, inject, computed, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  private readonly API_URL = 'http://localhost:8080/auth';
  private readonly TOKEN_KEY = 'clintec_token';
  private readonly USER_KEY = 'clintec_user';

  //Estado del usuario
  currentUser = signal<User | null>(this.getUserFromStorage());
  isAuthenticated = computed(() => !!this.currentUser());

  //LOGIN
  login(credentials: any): Observable<User> {
    return this.http.post<User>(`${this.API_URL}/login`, credentials).pipe(
      tap((user) => {
        this.setSession(user);
      }),
    );
  }

  //REGISTER
  register(userData: any): Observable<User> {
    return this.http.post<User>(`${this.API_URL}/register`, userData).pipe(
      tap((user) => {
        this.setSession(user);
      }),
    );
  }

  //Guardar sesión
  private setSession(user: User) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.TOKEN_KEY, user.token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }

    this.currentUser.set(user);
  }

  //Logout
  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }

    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  //Obtener rol
  getRole(): string | undefined {
    const user = this.currentUser();
    if (user && user.roles && user.roles.length > 0) {
      // Tomamos el primer rol de la lista y limpiamos el prefijo "ROLE_" si existe
      return user.roles[0].replace('ROLE_', '');
    }
    return undefined;
  }

  // Obtener usuario del localStorage
  private getUserFromStorage(): User | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    const userJson = localStorage.getItem(this.USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }
}
