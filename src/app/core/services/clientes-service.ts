import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ClientesRequest, ClientesResponse } from '../models/clientes.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ClientesService {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/api/clientes`;

  listarTodos(): Observable<ClientesResponse[]> {
    return this.http.get<ClientesResponse[]>(this.API_URL);
  }

  BuscarPorId(id: number): Observable<ClientesResponse> {
    return this.http.get<ClientesResponse>(`${this.API_URL}/${id}`);
  }

  BuscarPorEmail(email: string): Observable<ClientesResponse> {
    return this.http.get<ClientesResponse>(`${this.API_URL}/email/${email}`);
  }

  CrearCliente(cliente: ClientesRequest): Observable<ClientesResponse> {
    return this.http.post<ClientesResponse>(this.API_URL, cliente);
  }

  ActualizarCliente(id: number, cliente: ClientesRequest): Observable<ClientesResponse> {
    return this.http.put<ClientesResponse>(`${this.API_URL}/${id}`, cliente);
  }
}
