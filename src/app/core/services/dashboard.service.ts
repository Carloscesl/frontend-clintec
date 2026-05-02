import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AdminDashboard, AsesorDashboard, GerenteDashboard } from '../models/dashboard.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly URL = `${environment.apiUrl}/dashboard`;

  getAdmin(): Observable<AdminDashboard> {
    return this.http.get<AdminDashboard>(`${this.URL}/admin`);
  }

  getGerente(): Observable<GerenteDashboard> {
    return this.http.get<GerenteDashboard>(`${this.URL}/gerente`);
  }

  getAsesor(): Observable<AsesorDashboard> {
    return this.http.get<AsesorDashboard>(`${this.URL}/asesor`);
  }
}
