import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { VentaService } from '../../../../core/services/venta.service';
import { OportunidadService } from '../../../../core/services/oportunidad.service';
import { AuthService } from '../../../../core/services/auth.service';
import { MetodoPago } from '../../../../core/models/venta.model';
import { OportunidadResponse } from '../../../../core/models/oportunidad.model';

@Component({
  selector: 'app-sale-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe],
  templateUrl: './sale-form.component.html',
  styleUrl: './sale-form.component.css',
})
export class SaleFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private ventaServ = inject(VentaService);
  private opServ = inject(OportunidadService);
  private authService = inject(AuthService);

  oportunidad = signal<OportunidadResponse | null>(null);
  guardando = signal(false);
  error = signal<string | null>(null);
  loading = signal(false);

  private usuarioId = this.authService.obtenerUsuarioId()!;

  metodos: { valor: MetodoPago; label: string; icon: string }[] = [
    { valor: 'EFECTIVO', label: 'Efectivo', icon: '💵' },
    { valor: 'TRANSFERENCIA', label: 'Transferencia', icon: '🏦' },
    { valor: 'TARJETA_CREDITO', label: 'Tarjeta crédito', icon: '💳' },
    { valor: 'TARJETA_DEBITO', label: 'Tarjeta débito', icon: '🔵' },
  ];

  form = this.fb.group({
    valorVenta: [0, [Validators.required, Validators.min(1)]],
    paymentMethod: ['' as MetodoPago | '', Validators.required],
    notas: [''],
  });

  get f() {
    return this.form.controls;
  }

  ngOnInit(): void {
    // Lee el oportunidadId desde query params: /sales/registrar?oportunidadId=5
    const oportunidadId = this.route.snapshot.queryParamMap.get('oportunidadId');
    if (!oportunidadId) {
      this.error.set('No se especificó una oportunidad');
      return;
    }
    this.cargarOportunidad(Number(oportunidadId));
  }

  cargarOportunidad(id: number): void {
    this.loading.set(true);
    this.opServ.buscarPorId(id).subscribe({
      next: (op) => {
        this.oportunidad.set(op);
        // Precarga el valor estimado como valor sugerido
        this.form.patchValue({ valorVenta: op.valorEstimado });
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se encontró la oportunidad');
        this.loading.set(false);
      },
    });
  }

  submit(): void {
    if (this.form.invalid || !this.oportunidad()) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    this.error.set(null);

    this.ventaServ
      .create({
        idOportunidad: this.oportunidad()!.idOportunidad,
        idAsesor: this.usuarioId,
        valorVenta: this.form.value.valorVenta!,
        paymentMethod: this.form.value.paymentMethod as MetodoPago,
        notas: this.form.value.notas ?? '',
      })
      .subscribe({
        next: (venta) => {
          this.router.navigate(['/sales/detalle', venta.idVenta]);
        },
        error: (err) => {
          this.error.set(err.error?.message ?? 'Error al registrar la venta');
          this.guardando.set(false);
        },
      });
  }

  cancelar(): void {
    this.router.navigate(['/opportunities']);
  }
}
