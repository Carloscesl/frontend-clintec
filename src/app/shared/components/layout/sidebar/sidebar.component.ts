import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  path: string;
  roles: string[];

  labelPorRol?: Partial<Record<string, string>>;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  private readonly authService = inject(AuthService);

  collapsed = signal(false);
  rol = computed(() => this.authService.obtenerRol() ?? '');

  navItems: NavItem[] = [
    {
      label: 'Dashboard',
      labelPorRol: {
        ADMINISTRADOR: 'Panel General',
        GERENTE: 'Panel Gerencial',
        ASESOR: 'Mi Panel',
      },
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
      path: '',
      roles: ['ADMINISTRADOR', 'GERENTE', 'ASESOR'],
    },
    {
      label: 'Usuarios',
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
      path: '/users',
      roles: ['ADMINISTRADOR'],
    },
    {
      label: 'Clientes',
      labelPorRol: {
        ADMINISTRADOR: 'Clientes',
        GERENTE: 'Clientes',
        ASESOR: 'Mis Clientes',
      },
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
      path: '/clients',
      roles: ['ADMINISTRADOR', 'ASESOR', 'GERENTE'],
    },
    {
      label: 'Oportunidades',
      labelPorRol: {
        ADMINISTRADOR: 'Oportunidades',
        GERENTE: 'Oportunidades',
        ASESOR: 'Mis Oportunidades',
      },
      icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
      path: '/opportunities',
      roles: ['ADMINISTRADOR', 'ASESOR', 'GERENTE'],
    },
    {
      label: 'Ventas',
      labelPorRol: {
        ADMINISTRADOR: 'Ventas',
        GERENTE: 'Ventas',
        ASESOR: 'Mis Ventas',
      },
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 13v-1m0 0c-1.11 0-2.08-.402-2.599-1',
      path: '/sales',
      roles: ['GERENTE', 'ASESOR'],
    },
    {
      label: 'Interacciones',
      labelPorRol: {
        ADMINISTRADOR: 'Interacciones',
        GERENTE: 'Interacciones',
        ASESOR: 'Mis Interacciones',
      },
      icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
      path: '/interactions',
      roles: ['ASESOR', 'GERENTE'],
    },
    {
      label: 'Alertas',
      labelPorRol: {
        ADMINISTRADOR: 'Alertas',
        GERENTE: 'Alertas',
        ASESOR: 'Mis Alertas',
      },
      icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
      path: '/alerts',
      roles: ['ASESOR', 'GERENTE', 'ADMINISTRADOR'],
    },
    {
      label: 'Calificaciones',
      labelPorRol: {
        ADMINISTRADOR: 'Calificaciones',
        GERENTE: 'Calificaciones',
        ASESOR: 'Mis Calificaciones',
      },
      icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
      path: '/qualifications',
      roles: ['ASESOR', 'GERENTE'],
    },
  ];

  getLabelItem(item: NavItem): string {
    return item.labelPorRol?.[this.rol()] ?? item.label;
  }

  getPathItem(item: NavItem): string {
    if (item.path === '') {
      const dashboardPaths: Record<string, string> = {
        ADMINISTRADOR: '/dashboard/admin',
        GERENTE: '/dashboard/gerente',
        ASESOR: '/dashboard/asesor',
      };
      return dashboardPaths[this.rol()] ?? '/dashboard/admin';
    }
    return item.path;
  }

  get itemsVisibles(): NavItem[] {
    return this.navItems.filter((item) => item.roles.includes(this.rol()));
  }

  toggleCollapse(): void {
    this.collapsed.update((v) => !v);
  }
}
