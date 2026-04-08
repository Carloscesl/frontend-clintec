import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { UsuarioResponse, UsuarioRequest, UsuarioUpdateRequest } from '../models/usuario.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/api/usuarios`;

  // GET /api/usuarios → lista completa
  listarTodos(): Observable<UsuarioResponse[]> {
    return this.http.get<UsuarioResponse[]>(this.API_URL);
  }

  // GET /api/usuarios/id/{id}
  buscarPorId(id: number): Observable<UsuarioResponse> {
    return this.http.get<UsuarioResponse>(`${this.API_URL}/id/${id}`);
  }
  // GET /api/usuarios/email/{email}
  buscarPorEmail(email: string): Observable<UsuarioResponse> {
    return this.http.get<UsuarioResponse>(`${this.API_URL}/email/${email}`);
  }

  // POST /api/usuarios → crear usuario
  crear(dto: UsuarioRequest): Observable<UsuarioResponse> {
    return this.http.post<UsuarioResponse>(this.API_URL, dto);
  }

  // PUT /api/usuarios/{id} → actualizar usuario
  actualizar(id: number, dto: UsuarioUpdateRequest): Observable<UsuarioResponse> {
    return this.http.put<UsuarioResponse>(`${this.API_URL}/${id}`, dto);
  }

  // PATCH /api/usuarios/{email}/desactivar
  desactivar(email: string): Observable<void> {
    return this.http.patch<void>(`${this.API_URL}/${email}/desactivar`, {});
  }

  // PATCH /api/usuarios/{email}/activar
  activar(email: string): Observable<void> {
    return this.http.patch<void>(`${this.API_URL}/${email}/activar`, {});
  }
}
