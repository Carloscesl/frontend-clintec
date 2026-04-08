import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { UsuariosService } from '../../../../../core/services/usuarios-service';
import { UsuarioResponse } from '../../../../../core/models/usuario.model';
import { ModalService } from '../../../../../core/services/modal.service';

@Component({
  selector: 'app-lista-usuario',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './lista-usuario.html',
  styleUrl: './lista-usuario.css',
})
export class ListaUsuario implements OnInit {
  private usuarioService = inject(UsuariosService);
  private router = inject(Router);
  private modalService = inject(ModalService);

  // Signals para manejar estado reactivo (igual que en tu auth)
  usuarios = signal<UsuarioResponse[]>([]);
  cargando = signal(true);
  error = signal('');

  ngOnInit(): void {
    ~this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.cargando.set(true);
    this.error.set('');

    this.usuarioService.listarTodos().subscribe({
      next: (data) => {
        this.usuarios.set(data);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la lista de usuarios.');
        this.cargando.set(false);
      },
    });
  }

  irACrear(): void {
    this.router.navigate(['/admin/usuarios/nuevo']);
  }

  irAEditar(id: number): void {
    this.router.navigate(['/admin/usuarios/editar', id]);
  }

  cambiarEstado(usuario: UsuarioResponse): void {
    const accion$ = usuario.activo
      ? this.usuarioService.desactivar(usuario.email)
      : this.usuarioService.activar(usuario.email);

    accion$.subscribe({
      next: () => {
        this.modalService.exito(
          usuario.activo ? 'Usuario desactivado' : 'Usuario activado',
          usuario.activo
            ? `${usuario.nombre} fue desactivado correctamente.`
            : `${usuario.nombre} fue activado correctamente.`,
        );
        this.cargarUsuarios();
      },
      error: () => {
        this.modalService.error('Error', 'No se pudo cambiar el estado del usuario.');
      },
    });
  }
}
