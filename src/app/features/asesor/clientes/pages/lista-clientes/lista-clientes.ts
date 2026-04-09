import { Component, inject, OnInit, signal } from '@angular/core';
import { ClientesService } from '../../../../../core/services/clientes-service';
import { Router } from '@angular/router';
import { ModalService } from '../../../../../core/services/modal.service';
import { ClientesResponse } from '../../../../../core/models/clientes.model';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-lista-clientes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './lista-clientes.html',
  styleUrl: './lista-clientes.css',
})
export class ListaClientes implements OnInit {
  private clientesService = inject(ClientesService);
  private router = inject(Router);
  private modalService = inject(ModalService);

  clientes = signal<ClientesResponse[]>([]);
  cargando = signal(true);
  error = signal('');

  ngOnInit(): void {
    this.cargarClientes();
  }

  cargarClientes(): void {
    this.cargando.set(true);
    this.error.set('');

    this.clientesService.listarTodos().subscribe({
      next: (data) => {
        this.clientes.set(data);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la lista de clientes.');
        this.cargando.set(false);
      },
    });
  }

  irACrear(): void {
    // Detecta la ruta base actual para navegar correctamente
    const base = this.router.url.includes('gerente') ? '/gerente' : '/asesor';
    this.router.navigate([`${base}/clientes/nuevo`]);
  }

  irAEditar(id: number): void {
    const base = this.router.url.includes('gerente') ? '/gerente' : '/asesor';
    this.router.navigate([`${base}/clientes/editar`, id]);
  }
}
