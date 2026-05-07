import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  OportunidadRequest,
  OportunidadResponse,
  EtapaOportunidad,
} from '../models/oportunidad.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OportunidadService {
  private readonly URL = `${environment.apiUrl}/oportunidades`;

  constructor(private readonly http: HttpClient) {}

  listar(): Observable<OportunidadResponse[]> {
    return this.http.get<OportunidadResponse[]>(this.URL);
  }

  listarPorAsesor(idAsesor: number): Observable<OportunidadResponse[]> {
    return this.http.get<OportunidadResponse[]>(`${this.URL}/idasesor/${idAsesor}`);
  }

  buscarPorId(id: number): Observable<OportunidadResponse> {
    return this.http.get<OportunidadResponse>(`${this.URL}/id/${id}`);
  }

  buscarPorAsesor(id: number): Observable<OportunidadResponse[]> {
    return this.http.get<OportunidadResponse[]>(`${this.URL}/idasesor/${id}`);
  }

  buscarPorCliente(id: number): Observable<OportunidadResponse[]> {
    return this.http.get<OportunidadResponse[]>(`${this.URL}/idcliente/${id}`);
  }

  crear(dto: OportunidadRequest): Observable<OportunidadResponse> {
    return this.http.post<OportunidadResponse>(this.URL, dto);
  }

  actualizar(id: number, dto: OportunidadRequest): Observable<OportunidadResponse> {
    return this.http.put<OportunidadResponse>(`${this.URL}/${id}`, dto);
  }

  cambiarEtapa(id: number, etapa: EtapaOportunidad): Observable<OportunidadResponse> {
    return this.http.patch<OportunidadResponse>(`${this.URL}/${id}/etapa?etapa=${etapa}`, {});
  }

  ajustarProbabilidad(id: number, probabilidad: number): Observable<OportunidadResponse> {
    return this.http.patch<OportunidadResponse>(
      `${this.URL}/${id}/probabilidad?probabilidad=${probabilidad}`,
      {},
    );
  }

  cerrarGanada(id: number): Observable<void> {
    return this.http.patch<void>(`${this.URL}/${id}/ganar`, {});
  }

  cerrarPerdida(id: number): Observable<void> {
    return this.http.patch<void>(`${this.URL}/${id}/perder`, {});
  }
}
