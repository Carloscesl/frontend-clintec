import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VentaRequest, VentaResponse } from '../models/venta.model';

@Injectable({
  providedIn: 'root',
})
export class VentaService {
  private readonly URL = `${environment.apiUrl}/venta`;
  constructor(private readonly http: HttpClient) {}

  listAll(): Observable<VentaResponse[]> {
    return this.http.get<VentaResponse[]>(this.URL);
  }

  findId(id: number): Observable<VentaResponse> {
    return this.http.get<VentaResponse>(`${this.URL}/${id}`);
  }

  findAssessor(id: number): Observable<VentaResponse[]> {
    return this.http.get<VentaResponse[]>(`${this.URL}/buscarasesor/${id}`);
  }

  findOpportunity(id: number): Observable<VentaResponse[]> {
    return this.http.get<VentaResponse[]>(`${this.URL}/buscaroportunidad/${id}`);
  }

  create(dto: VentaRequest): Observable<VentaResponse> {
    return this.http.post<VentaResponse>(this.URL, dto);
  }

  updateSale(id: number, dto: VentaRequest): Observable<VentaResponse> {
    return this.http.put<VentaResponse>(`${this.URL}/actualizarventa/${id}`, dto);
  }
}
