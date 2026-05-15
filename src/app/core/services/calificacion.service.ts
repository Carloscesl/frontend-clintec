import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import {
  QualificationClient,
  QualificationDistribucion,
  QualificationHistory,
  QualificationLevel,
} from '../models/calificacion.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CalificacionService {
  private readonly URL = `${environment.apiUrl}/calificaciones`;

  constructor(private readonly httpClient: HttpClient) {}

  findAll(): Observable<QualificationClient[]> {
    return this.httpClient.get<QualificationClient[]>(this.URL);
  }

  findByClienteId(clienteId: number): Observable<QualificationClient> {
    return this.httpClient.get<QualificationClient>(`${this.URL}/cliente/${clienteId}`);
  }

  findByClasificacion(nivel: QualificationLevel): Observable<QualificationClient[]> {
    return this.httpClient.get<QualificationClient[]>(`${this.URL}/clasificacion/${nivel}`);
  }

  findTopN(n: number): Observable<QualificationClient[]> {
    return this.httpClient.get<QualificationClient[]>(`${this.URL}/top/${n}`);
  }

  findEnRiesgo(): Observable<QualificationClient[]> {
    return this.httpClient.get<QualificationClient[]>(`${this.URL}/en-riesgo`);
  }

  distribucion(): Observable<QualificationDistribucion> {
    return this.httpClient.get<QualificationDistribucion>(`${this.URL}/distribucion`);
  }

  historialPorCliente(clienteId: number): Observable<QualificationHistory[]> {
    return this.httpClient.get<QualificationHistory[]>(
      `${this.URL}/cliente/${clienteId}/historial`,
    );
  }

  actualizarPuntaje(clienteId: number, puntaje: number): Observable<QualificationClient> {
    return this.httpClient.patch<QualificationClient>(`${this.URL}/cliente/${clienteId}/puntaje`, {
      puntaje,
    });
  }
}
