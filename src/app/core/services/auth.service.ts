import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginRequest, RegisterRequest, TokenResponse } from '../models/auth.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly URL = `${environment.apiUrl}/auth`;

  constructor(private readonly http: HttpClient) {}

  login(request: LoginRequest): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.URL}/login`, request);
  }

  register(request: RegisterRequest): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.URL}/register`, request);
  }

  guardarSesion(response: TokenResponse): void {
    localStorage.setItem('clintec_token', response.token);
    localStorage.setItem('clintec_user', JSON.stringify(response));
  }

  obtenerToken(): string | null {
    return localStorage.getItem('clintec_token');
  }

  obtenerUsuario(): TokenResponse | null {
    const user = localStorage.getItem('clintec_user');
    return user ? JSON.parse(user) : null;
  }
  obtenerUsuarioId(): number | null {
    const user = this.obtenerUsuario();
    return user?.id ?? null;
  }

  obtenerRol(): string | null {
    const user = this.obtenerUsuario();
    return user?.roles?.[0] ?? null;
  }

  estaAutenticado(): boolean {
    return !!this.obtenerToken();
  }

  cerrarSesion(): void {
    localStorage.removeItem('clintec_token');
    localStorage.removeItem('clintec_user');
  }
}
