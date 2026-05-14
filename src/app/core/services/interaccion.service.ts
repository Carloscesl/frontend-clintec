import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { InteraccionRequest, InteraccionResponse } from '../models/interaccion.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class InteraccionService {
  private readonly URL = `${environment.apiUrl}/interacciones`;

  constructor(private readonly http: HttpClient) {}

  listar(): Observable<InteraccionResponse[]> {
    return this.http.get<InteraccionResponse[]>(this.URL);
  }

  buscarPorId(id: number): Observable<InteraccionResponse> {
    return this.http.get<InteraccionResponse>(`${this.URL}/${id}`);
  }

  listarPorCliente(idCliente: number): Observable<InteraccionResponse[]> {
    return this.http.get<InteraccionResponse[]>(`${this.URL}/cliente/${idCliente}`);
  }

  listarPorUsuario(idUsuario: number): Observable<InteraccionResponse[]> {
    return this.http.get<InteraccionResponse[]>(`${this.URL}/usuario/${idUsuario}`);
  }

  listarPorOportunidad(idOportunidad: number): Observable<InteraccionResponse[]> {
    return this.http.get<InteraccionResponse[]>(`${this.URL}/oportunidad/${idOportunidad}`);
  }

  crear(dto: InteraccionRequest): Observable<InteraccionResponse> {
    return this.http.post<InteraccionResponse>(this.URL, dto);
  }

  actualizar(id: number, dto: InteraccionRequest): Observable<InteraccionResponse> {
    return this.http.put<InteraccionResponse>(`${this.URL}/${id}`, dto);
  }
}
