import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AlertaResponse } from '../models/alerta.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AlertaService {
  private readonly URL = `${environment.apiUrl}/alertas`;

  constructor(private readonly http: HttpClient) {}

  listar(): Observable<AlertaResponse[]> {
    return this.http.get<AlertaResponse[]>(this.URL);
  }

  pendientes(): Observable<AlertaResponse[]> {
    return this.http.get<AlertaResponse[]>(`${this.URL}/pendientes`);
  }

  porCliente(clienteId: number): Observable<AlertaResponse[]> {
    return this.http.get<AlertaResponse[]>(`${this.URL}/cliente/${clienteId}`);
  }

  marcarVista(id: number): Observable<AlertaResponse> {
    return this.http.patch<AlertaResponse>(`${this.URL}/${id}/vista`, {});
  }

  resolver(id: number): Observable<AlertaResponse> {
    return this.http.patch<AlertaResponse>(`${this.URL}/${id}/resolver`, {});
  }
}
