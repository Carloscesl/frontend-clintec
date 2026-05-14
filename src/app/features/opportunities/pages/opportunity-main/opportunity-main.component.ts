import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { UsuarioService } from '../../../../core/services/usuario.service';
import { OportunidadService } from '../../../../core/services/oportunidad.service';

import { forkJoin } from 'rxjs';
import { OportunidadResponse } from '../../../../core/models/oportunidad.model';
import { UsuarioResponse } from '../../../../core/models/usuario.model';

interface AsesorConOportunidades extends UsuarioResponse {
  oportunidades: OportunidadResponse[];
  cargandoOps: boolean;
}

@Component({
  selector: 'app-opportunity-main',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe],
  templateUrl: './opportunity-main.component.html',
  styleUrl: './opportunity-main.component.css',
})
export class OpportunityMainComponent implements OnInit {
  private readonly usuarioService = inject(UsuarioService);
  private readonly oportunidadService = inject(OportunidadService);
  private readonly router = inject(Router);

  // Usamos una sola señal para mantener el estado agrupado
  dataAsesores = signal<AsesorConOportunidades[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.cargarTodo();
  }

  cargarTodo(): void {
    this.loading.set(true);
    this.error.set(null);

    // 1. Cargamos los asesores primero
    this.usuarioService.listarPorRol('ASESOR').subscribe({
      next: (asesoresData) => {
        // Inicializamos la lista de asesores con un array de oportunidades vacío
        const inicializados = asesoresData.map((a) => ({
          ...a,
          oportunidades: [],
          cargandoOps: true,
        }));
        this.dataAsesores.set(inicializados);

        // 2. Cargamos las oportunidades de cada asesor en paralelo
        this.cargarOportunidadesPorAsesor(inicializados);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Error al cargar la lista de asesores');
      },
    });
  }

  private cargarOportunidadesPorAsesor(asesores: AsesorConOportunidades[]): void {
    if (asesores.length === 0) {
      this.loading.set(false);
      return;
    }

    // Creamos un array de peticiones observables
    const peticiones = asesores.map((a) => this.oportunidadService.listarPorAsesor(a.id));

    // forkJoin ejecuta todas las peticiones al mismo tiempo y espera a que terminen
    forkJoin(peticiones).subscribe({
      next: (resultados) => {
        const actualizados = asesores.map((a, index) => ({
          ...a,
          oportunidades: resultados[index],
          cargandoOps: false,
        }));

        this.dataAsesores.set(actualizados);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar el detalle de oportunidades');
        this.loading.set(false);
      },
    });
  }

  irAcrear(): void {
    this.router.navigate(['/opportunities/crear']);
  }

  irAeditar(idOportunidad: number): void {
    console.log('Editando ID:', idOportunidad);
    this.router.navigate(['/opportunities/editar', idOportunidad]);
  }
}
