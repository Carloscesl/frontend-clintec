import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ClienteService } from '../../../../core/services/cliente.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ClienteResponse } from '../../../../core/models/cliente.model';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './client-list.component.html',
  styleUrl: './client-list.component.css',
})
export class ClientListComponent implements OnInit {
  private clienteService = inject(ClienteService);
  private authService = inject(AuthService);
  private router = inject(Router);

  clientes = signal<ClienteResponse[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  private rol = this.authService.obtenerRol() ?? '';
  puedeCrear = ['ADMINISTRADOR', 'GERENTE'].includes(this.rol);
  puedeEditar = ['ADMINISTRADOR', 'GERENTE'].includes(this.rol);

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    this.error.set(null);
    this.clienteService.listar().subscribe({
      next: (data) => {
        this.clientes.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al cargar clientes');
        this.loading.set(false);
      },
    });
  }

  irACrear(): void {
    this.router.navigate(['/clients/crear']);
  }

  irAEditar(id: number): void {
    this.router.navigate(['/clients/editar', id]);
  }

  irADetalle(id: number): void {
    this.router.navigate(['/clients/detalle', id]);
  }
}
