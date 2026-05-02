import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UsuarioRequest, UsuarioResponse, UsuarioUpdateRequest } from '../models/usuario.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly URL = `${environment.apiUrl}/usuarios`;

  constructor(private http: HttpClient) {}

  listar(): Observable<UsuarioResponse[]> {
    return this.http.get<UsuarioResponse[]>(this.URL);
  }

  buscarPorId(id: number): Observable<UsuarioResponse> {
    return this.http.get<UsuarioResponse>(`${this.URL}/id/${id}`);
  }

  crear(dto: UsuarioRequest): Observable<UsuarioResponse> {
    return this.http.post<UsuarioResponse>(this.URL, dto);
  }

  actualizar(id: number, dto: UsuarioUpdateRequest): Observable<UsuarioResponse> {
    return this.http.put<UsuarioResponse>(`${this.URL}/${id}`, dto);
  }

  activar(email: string): Observable<void> {
    return this.http.patch<void>(`${this.URL}/${email}/activar`, {});
  }

  desactivar(email: string): Observable<void> {
    return this.http.patch<void>(`${this.URL}/${email}/desactivar`, {});
  }
}
