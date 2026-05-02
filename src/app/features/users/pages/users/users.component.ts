import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { UsuarioService } from '../../../../core/services/usuario.service';
import { Router } from '@angular/router';
import { UsuarioResponse } from '../../../../core/models/usuario.model';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css',
})
export class UsersComponent implements OnInit {
  private readonly usuarioService = inject(UsuarioService);
  private readonly routes = inject(Router);

  usuarios = signal<UsuarioResponse[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  accionando = signal<number | null>(null);

  ngOnInit() {
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    this.error.set(null);

    this.usuarioService.listar().subscribe({
      next: (data) => {
        this.usuarios.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar usuarios');
        this.loading.set(false);
      },
    });
  }

  irACrear(): void {
    this.routes.navigate(['/users/create']);
  }

  irAEditar(id: number): void {
    this.routes.navigate(['/users/edit', id]);
  }

  toggleEstado(email: string, activo: boolean, id: number): void {
    this.accionando.set(id);

    const accion = activo
      ? this.usuarioService.desactivar(email)
      : this.usuarioService.activar(email);
    accion.subscribe({
      next: () => {
        this.accionando.set(null);
        this.cargar();
      },
      error: () => {
        this.accionando.set(null);
        this.error.set('Error al cambiar estado del usuario');
      },
    });
  }
}
