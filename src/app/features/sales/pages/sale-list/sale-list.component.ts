import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';
import { VentaService } from '../../../../core/services/venta.service';
import { VentaResponse, MetodoPago } from '../../../../core/models/venta.model';

@Component({
  selector: 'app-sale-list',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './sale-list.component.html',
  styleUrl: './sale-list.component.css',
})
export class SaleListComponent implements OnInit {
  private service = inject(VentaService);
  private router = inject(Router);

  ventas = signal<VentaResponse[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  filtroMetodo = signal<MetodoPago | 'TODOS'>('TODOS');

  metodos: { valor: MetodoPago | 'TODOS'; label: string; icon: string }[] = [
    { valor: 'TODOS', label: 'Todos', icon: '◈' },
    { valor: 'EFECTIVO', label: 'Efectivo', icon: '💵' },
    { valor: 'TRANSFERENCIA', label: 'Transferencia', icon: '🏦' },
    { valor: 'TARJETA_CREDITO', label: 'Tarjeta crédito', icon: '💳' },
    { valor: 'TARJETA_DEBITO', label: 'Tarjeta débito', icon: '💳' },
  ];

  // Ventas filtradas por método
  ventasFiltradas = computed(() => {
    const metodo = this.filtroMetodo();
    if (metodo === 'TODOS') return this.ventas();
    return this.ventas().filter((v) => v.paymentMethod === metodo);
  });

  // KPIs calculados
  totalVentas = computed(() => this.ventasFiltradas().length);

  valorTotal = computed(() => this.ventasFiltradas().reduce((acc, v) => acc + v.valorVenta, 0));

  valorPromedio = computed(() =>
    this.totalVentas() > 0 ? this.valorTotal() / this.totalVentas() : 0,
  );

  ventaMayor = computed(() =>
    this.ventasFiltradas().reduce((max, v) => (v.valorVenta > max ? v.valorVenta : max), 0),
  );

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    this.error.set(null);
    this.service.listAll().subscribe({
      next: (data) => {
        const ordenadas = data.sort(
          (a, b) => new Date(b.fechaVenta).getTime() - new Date(a.fechaVenta).getTime(),
        );
        this.ventas.set(ordenadas);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar ventas');
        this.loading.set(false);
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

  irADetalle(id: number): void {
    this.router.navigate(['/sales/detalle', id]);
  }
}
