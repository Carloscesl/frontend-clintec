import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ClienteRequest, ClienteResponse } from '../models/cliente.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private readonly URL = `${environment.apiUrl}/clientes`;

  constructor(private readonly http: HttpClient) {}

  listar(): Observable<ClienteResponse[]> {
    return this.http.get<ClienteResponse[]>(this.URL);
  }

  buscarPorId(id: number): Observable<ClienteResponse> {
    return this.http.get<ClienteResponse>(`${this.URL}/${id}`);
  }

  crear(dto: ClienteRequest): Observable<ClienteResponse> {
    return this.http.post<ClienteResponse>(this.URL, dto);
  }

  actualizar(id: number, dto: ClienteRequest): Observable<ClienteResponse> {
    return this.http.put<ClienteResponse>(`${this.URL}/${id}`, dto);
  }
}
