import { Component, OnInit, OnDestroy, inject, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { forkJoin } from 'rxjs';
import { DashboardService } from '../../../../core/services/dashboard.service';
import { AdminDashboard } from '../../../../core/models/dashboard.model';
import { AuthService } from '../../../../core/services/auth.service';
import { CalificacionService } from '../../../../core/services/calificacion.service';
import { QualificationDistribucion } from '../../../../core/models/calificacion.model';

Chart.register(...registerables);

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css',
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  @ViewChild('graficaEmbudo') graficaEmbudoRef!: ElementRef;
  @ViewChild('graficaEstado') graficaEstadoRef!: ElementRef;
  @ViewChild('graficaDistribucion') graficaDistribucionRef!: ElementRef;

  private readonly service = inject(DashboardService);
  private readonly authService = inject(AuthService);
  private readonly qualificationSvc = inject(CalificacionService);

  data = signal<AdminDashboard | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  usuario = this.authService.obtenerUsuario();

  private chartEmbudo: Chart | null = null;
  private chartEstado: Chart | null = null;
  private chartDistribucion: Chart | null = null;

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      dashboard: this.service.getAdmin(),
      distribucion: this.qualificationSvc.distribucion(),
    }).subscribe({
      next: ({ dashboard, distribucion }) => {
        this.data.set(dashboard);
        this.loading.set(false);
        setTimeout(() => this.dibujarGraficas(distribucion), 100); // ✅ pasa el parámetro
      },
      error: () => {
        this.error.set('Error al cargar el dashboard');
        this.loading.set(false);
      },
    });
  }

  // ✅ Firma corregida — recibe distribucion como parámetro
  dibujarGraficas(distribucion?: QualificationDistribucion): void {
    if (!this.data()) return;
    const d = this.data()!;

    if (this.chartEmbudo) this.chartEmbudo.destroy();
    if (this.chartEstado) this.chartEstado.destroy();

    // Gráfica 1 — Embudo
    if (this.graficaEmbudoRef) {
      this.chartEmbudo = new Chart(this.graficaEmbudoRef.nativeElement, {
        type: 'bar',
        data: {
          labels: [
            'Prospección',
            'Calificación',
            'Propuesta',
            'Negociación',
            'C. Ganado',
            'C. Perdido',
          ],
          datasets: [
            {
              label: 'Oportunidades',
              data: [
                d.enProspeccion,
                d.enCalificacion,
                d.enPropuesta,
                d.enNegociacion,
                d.enCierreGanado,
                d.enCierrePerdido,
              ],
              backgroundColor: ['#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899', '#10B981', '#EF4444'],
              borderRadius: 6,
              borderWidth: 0,
            },
          ],
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } } },
        },
      });
    }

    // Gráfica 2 — Estado (dona)
    if (this.graficaEstadoRef) {
      this.chartEstado = new Chart(this.graficaEstadoRef.nativeElement, {
        type: 'doughnut',
        data: {
          labels: ['Activas', 'Ganadas', 'Perdidas'],
          datasets: [
            {
              data: [d.oportunidadesActivas, d.oportunidadesGanadas, d.oportunidadesPerdidas],
              backgroundColor: ['#3B82F6', '#10B981', '#EF4444'],
              borderWidth: 0,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: { legend: { position: 'bottom' } },
        },
      });
    }

    // Gráfica 3 — Distribución de cartera
    if (this.chartDistribucion) this.chartDistribucion.destroy();
    if (this.graficaDistribucionRef && distribucion) {
      const dist = distribucion.distribucion;
      this.chartDistribucion = new Chart(this.graficaDistribucionRef.nativeElement, {
        type: 'doughnut',
        data: {
          labels: ['❄️ Frío', '🌤️ Tibio', '🔥 Caliente', '👑 VIP'],
          datasets: [
            {
              data: [
                dist['FRIO'] ?? 0,
                dist['TIBIO'] ?? 0,
                dist['CALIENTE'] ?? 0,
                dist['VIP'] ?? 0,
              ],
              backgroundColor: ['#60a5fa', '#fb923c', '#f97316', '#a855f7'],
              borderWidth: 0,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom' } },
        },
      });
    }
  }

  // ✅ Destruye las 3 gráficas
  ngOnDestroy(): void {
    if (this.chartEmbudo) this.chartEmbudo.destroy();
    if (this.chartEstado) this.chartEstado.destroy();
    if (this.chartDistribucion) this.chartDistribucion.destroy();
  }
}
