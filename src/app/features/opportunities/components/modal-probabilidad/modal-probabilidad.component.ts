import {
  Component,
  computed,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  signal,
} from '@angular/core';
import { OportunidadService } from '../../../../core/services/oportunidad.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { EtapaOportunidad, STAGE_RANGES } from '../../../../core/models/oportunidad.model';

@Component({
  selector: 'app-modal-probabilidad',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modal-probabilidad.component.html',
  styleUrl: './modal-probabilidad.component.css',
})
export class ModalProbabilidadComponent implements OnInit {
  @Input() oportunidadId!: number;
  @Input() etapa!: EtapaOportunidad;
  @Input() probabilidadActual!: number;

  @Output() cerrar = new EventEmitter<void>();
  @Output() guardado = new EventEmitter<number>();

  private fb = inject(FormBuilder);
  private service = inject(OportunidadService);

  guardando = signal(false);
  error = signal<string | null>(null);

  get rango() {
    return STAGE_RANGES[this.etapa];
  }

  form = this.fb.group({
    probabilidad: [0, [Validators.required]],
  });

  get f() {
    return this.form.controls;
  }

  get valorActual(): number {
    return this.form.get('probabilidad')?.value ?? this.probabilidadActual;
  }

  ngOnInit(): void {
    this.form.patchValue({ probabilidad: this.probabilidadActual });

    this.f['probabilidad'].setValidators([
      Validators.required,
      Validators.min(this.rango.min),
      Validators.max(this.rango.max),
    ]);
    this.f['probabilidad'].updateValueAndValidity();
  }

  getColor(valor: number): string {
    if (valor <= 20) return '#3B82F6';
    if (valor <= 40) return '#A855F7';
    if (valor <= 60) return '#06B6D4';
    if (valor <= 85) return '#F59E0B';
    return '#10B981';
  }

  resetearDefault(): void {
    this.form.patchValue({ probabilidad: this.rango.default });
  }

  submit(): void {
    if (this.form.invalid) {
      this.f['probabilidad'].markAsTouched();
      return;
    }

    this.guardando.set(true);
    this.error.set(null);

    const nuevaProb = this.form.value.probabilidad!;

    this.service.ajustarProbabilidad(this.oportunidadId, nuevaProb).subscribe({
      next: (response) => {
        this.guardando.set(false);
        this.guardado.emit(response.probabilidad);
      },
      error: (err) => {
        this.error.set(err.error?.message ?? 'Error al actualizar la probabilidad');
        this.guardando.set(false);
      },
    });
  }
}
