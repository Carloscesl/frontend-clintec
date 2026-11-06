import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BackupResponse, BackupRestoreResponse } from '../models/backup.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BackupService {
  private readonly URL = `${environment.apiUrl}/backups`;

  constructor(private readonly http: HttpClient) {}

  listar(): Observable<BackupResponse[]> {
    return this.http.get<BackupResponse[]>(this.URL);
  }

  crear(): Observable<BackupResponse> {
    return this.http.post<BackupResponse>(this.URL, {});
  }

  restaurar(id: number): Observable<BackupRestoreResponse> {
    return this.http.post<BackupRestoreResponse>(`${this.URL}/${id}/restaurar`, {});
  }

  // Devuelve el archivo como Blob (el interceptor ya agrega el token)
  descargar(id: number): Observable<Blob> {
    return this.http.get(`${this.URL}/${id}/descargar`, { responseType: 'blob' });
  }
}
