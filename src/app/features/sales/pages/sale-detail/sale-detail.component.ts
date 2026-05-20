import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { VentaService } from '../../../../core/services/venta.service';
import { OportunidadService } from '../../../../core/services/oportunidad.service';
import { VentaResponse, MetodoPago } from '../../../../core/models/venta.model';
import { OportunidadResponse } from '../../../../core/models/oportunidad.model';

@Component({
  selector: 'app-sale-detail',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './sale-detail.component.html',
  styleUrl: './sale-detail.component.css',
})
export class SaleDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private ventaServ = inject(VentaService);
  private opServ = inject(OportunidadService);

  venta = signal<VentaResponse | null>(null);
  oportunidad = signal<OportunidadResponse | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  // Diferencia entre valor estimado y real
  diferencia = signal<number>(0);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.cargar(Number(id));
  }

  cargar(id: number): void {
    this.ventaServ.findId(id).subscribe({
      next: (venta) => {
        this.venta.set(venta);
        this.loading.set(false);
        this.cargarOportunidad(venta.idOportunidad);
      },
      error: () => {
        this.error.set('No se encontró la venta');
        this.loading.set(false);
      },
    });
  }

  cargarOportunidad(id: number): void {
    this.opServ.buscarPorId(id).subscribe({
      next: (op) => {
        this.oportunidad.set(op);
        // Calcula diferencia entre estimado y real
        const diff = this.venta()!.valorVenta - op.valorEstimado;
        this.diferencia.set(diff);
      },
    });
  }

  getMetodoConfig(metodo: MetodoPago) {
    const config: Record<MetodoPago, { icon: string; color: string; bg: string }> = {
      EFECTIVO: { icon: '💵', color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
      TRANSFERENCIA: { icon: '🏦', color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
      TARJETA_CREDITO: { icon: '💳', color: '#A855F7', bg: 'rgba(168,85,247,0.12)' },
      TARJETA_DEBITO: { icon: '💳', color: '#06B6D4', bg: 'rgba(6,182,212,0.12)' },
    };
    return config[metodo];
  }

  volver(): void {
    this.router.navigate(['/sales']);
  }
}
