import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  private readonly API_URL = `${environment.apiUrl}/api`;

  listarUsuarios() {
    return this.http.get(`${this.API_URL}/usuarios`);
  }

  desactivarUsuario(email: string) {
    return this.http.post(`${this.API_URL}/usuarios/${email}/desactivar`, {});
  }

  activarUsuario(email: string) {
    return this.http.post(`${this.API_URL}/usuarios/${email}/activar`, {});
  }

  actualizarUsuario(id: number, data: any) {
    return this.http.put(`${this.API_URL}/usuarios/${id}`, data);
  }
  crearUsuario(userData: any) {
    return this.http.post(`${this.API_URL}/usuarios`, userData);
  }
}
