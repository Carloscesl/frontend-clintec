import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { VentaService } from '../../../../core/services/venta.service';
import { OportunidadService } from '../../../../core/services/oportunidad.service';
import { AuthService } from '../../../../core/services/auth.service';
import { VentaResponse, MetodoPago } from '../../../../core/models/venta.model';
import { OportunidadResponse } from '../../../../core/models/oportunidad.model';

@Component({
  selector: 'app-sale-list',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, TranslatePipe],
  templateUrl: './sale-list.component.html',
  styleUrl: './sale-list.component.css',
})
export class SaleListComponent implements OnInit {
  private readonly service = inject(VentaService);
  private readonly opService = inject(OportunidadService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);

  ventas = signal<VentaResponse[]>([]);
  oportunidadesPendientes = signal<OportunidadResponse[]>([]);
  loading = signal(true);
  loadingOps = signal(false);
  error = signal<string | null>(null);
  filtroMetodo = signal<MetodoPago | 'TODOS'>('TODOS');

  // Rol del usuario
  private readonly rol = this.authService.obtenerRol() ?? '';
  private readonly usuarioId = this.authService.obtenerUsuarioId();
  esAsesor = this.rol === 'ASESOR';

  metodos: { valor: MetodoPago | 'TODOS'; label: string; icon: string }[] = [
    { valor: 'TODOS', label: 'SALES.PAYMENT.TODOS', icon: '◈' },
    { valor: 'EFECTIVO', label: 'SALES.PAYMENT.EFECTIVO', icon: '💵' },
    { valor: 'TRANSFERENCIA', label: 'SALES.PAYMENT.TRANSFERENCIA', icon: '🏦' },
    { valor: 'TARJETA_CREDITO', label: 'SALES.PAYMENT.TARJETA_CREDITO', icon: '💳' },
    { valor: 'TARJETA_DEBITO', label: 'SALES.PAYMENT.TARJETA_DEBITO', icon: '💳' },
  ];

  ventasFiltradas = computed(() => {
    const metodo = this.filtroMetodo();
    if (metodo === 'TODOS') return this.ventas();
    return this.ventas().filter((v) => v.paymentMethod === metodo);
  });

  totalVentas = computed(() => this.ventasFiltradas().length);
  valorTotal = computed(() => this.ventasFiltradas().reduce((a, v) => a + v.valorVenta, 0));
  valorPromedio = computed(() =>
    this.totalVentas() > 0 ? this.valorTotal() / this.totalVentas() : 0,
  );
  ventaMayor = computed(() =>
    this.ventasFiltradas().reduce((max, v) => (v.valorVenta > max ? v.valorVenta : max), 0),
  );

  ngOnInit(): void {
    this.cargar();
    // El asesor también ve sus oportunidades ganadas sin venta registrada
    if (this.esAsesor && this.usuarioId) {
      this.cargarOportunidadesPendientes();
    }
  }

  cargar(): void {
    this.loading.set(true);
    this.error.set(null);

    const peticion =
      this.esAsesor && this.usuarioId
        ? this.service.findAssessor(this.usuarioId)
        : this.service.listAll();

    peticion.subscribe({
      next: (data) => {
        this.ventas.set(
          data.sort((a, b) => new Date(b.fechaVenta).getTime() - new Date(a.fechaVenta).getTime()),
        );
        this.loading.set(false);
      },
      error: () => {
        this.error.set(this.translate.instant('SALES.LIST.ERROR_LOAD'));
        this.loading.set(false);
      },
    });
  }

  cargarOportunidadesPendientes(): void {
    this.loadingOps.set(true);
    this.opService.listarPorAsesor(this.usuarioId!).subscribe({
      next: (ops) => {
        const pendientes = ops.filter((o) => o.estado === 'GANADA' && o.ventaId === null);
        this.oportunidadesPendientes.set(pendientes);
        this.loadingOps.set(false);
      },
      error: () => this.loadingOps.set(false),
    });
  }

  registrarVenta(op: OportunidadResponse): void {
    this.router.navigate(['/sales/registrar'], {
      queryParams: { oportunidadId: op.idOportunidad },
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

  irADetalle(id: number): void {
    this.router.navigate(['/sales/detalle', id]);
  }
}
