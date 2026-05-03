import { Component, OnInit, OnDestroy, inject, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { DashboardService } from '../../../../core/services/dashboard.service';
import { GerenteDashboard } from '../../../../core/models/dashboard.model';
import { AuthService } from '../../../../core/services/auth.service';

Chart.register(...registerables);

@Component({
  selector: 'app-gerente-dashboard',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './gerente-dashboard.component.html',
  styleUrl: './gerente-dashboard.component.css',
})
export class GerenteDashboardComponent implements OnInit, OnDestroy {
  @ViewChild('graficaEmbudo') graficaEmbudoRef!: ElementRef;
  @ViewChild('graficaEstado') graficaEstadoRef!: ElementRef;

  private readonly service = inject(DashboardService);
  private readonly authService = inject(AuthService);

  data = signal<GerenteDashboard | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  usuario = this.authService.obtenerUsuario();

  private chartEmbudo: Chart | null = null;
  private chartEstado: Chart | null = null;

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    this.error.set(null);
    this.service.getGerente().subscribe({
      next: (d) => {
        this.data.set(d);
        this.loading.set(false);
        setTimeout(() => this.dibujarGraficas(), 100);
      },
      error: () => {
        this.error.set('Error al cargar el dashboard');
        this.loading.set(false);
      },
    });
  }

  dibujarGraficas(): void {
    if (!this.data()) return;
    const d = this.data()!;

    if (this.chartEmbudo) this.chartEmbudo.destroy();
    if (this.chartEstado) this.chartEstado.destroy();

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
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } } },
        },
      });
    }

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
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom' } },
        },
      });
    }
  }

  ngOnDestroy(): void {
    if (this.chartEmbudo) this.chartEmbudo.destroy();
    if (this.chartEstado) this.chartEstado.destroy();
  }
}
