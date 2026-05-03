import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ClienteService } from '../../../../core/services/cliente.service';
import { ClienteResponse } from '../../../../core/models/cliente.model';

@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './client-detail.component.html',
  styleUrl: './client-detail.component.css',
})
export class ClientDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly clienteService = inject(ClienteService);

  cliente = signal<ClienteResponse | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargar(Number(id));
    }
  }

  cargar(id: number): void {
    this.clienteService.buscarPorId(id).subscribe({
      next: (c) => {
        this.cliente.set(c);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se encontró el cliente');
        this.loading.set(false);
      },
    });
  }

  volver(): void {
    this.router.navigate(['/clients']);
  }
}
