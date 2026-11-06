import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { provideRouter } from '@angular/router';
import { SidebarComponent } from './sidebar.component';
import { AuthService } from '../../../../core/services/auth.service';

const authServiceMock = {
  obtenerRol: vi.fn(),
};

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;

  const setup = async (rol: string | null = 'ADMINISTRADOR') => {
    vi.clearAllMocks();
    authServiceMock.obtenerRol.mockReturnValue(rol);

    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [provideRouter([]), { provide: AuthService, useValue: authServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  it('debería crearse', async () => {
    await setup();
    expect(component).toBeTruthy();
  });

  it('debería iniciar sin colapsar', async () => {
    await setup();
    expect(component.collapsed()).toBe(false);
  });

  it('toggleCollapse debería alternar el estado collapsed', async () => {
    await setup();
    component.toggleCollapse();
    expect(component.collapsed()).toBe(true);
    component.toggleCollapse();
    expect(component.collapsed()).toBe(false);
  });

  describe('itemsVisibles según rol', () => {
    it('ADMINISTRADOR debería ver: Dashboard, Usuarios, Clientes, Oportunidades, Alertas', async () => {
      await setup('ADMINISTRADOR');
      const keys = component.itemsVisibles.map((i) => i.key);
      expect(keys).toContain('DASHBOARD');
      expect(keys).toContain('USERS');
      expect(keys).toContain('CLIENTS');
      expect(keys).toContain('OPPORTUNITIES');
      expect(keys).toContain('ALERTS');
      expect(keys).not.toContain('SALES');
    });

    it('ASESOR no debería ver Usuarios', async () => {
      await setup('ASESOR');
      const keys = component.itemsVisibles.map((i) => i.key);
      expect(keys).not.toContain('USERS');
      expect(keys).toContain('SALES');
      expect(keys).toContain('INTERACTIONS');
    });

    it('GERENTE debería ver Ventas e Interacciones', async () => {
      await setup('GERENTE');
      const keys = component.itemsVisibles.map((i) => i.key);
      expect(keys).toContain('SALES');
      expect(keys).toContain('INTERACTIONS');
      expect(keys).not.toContain('USERS');
    });

    it('sin rol no debería ver ningún item', async () => {
      await setup(null);
      expect(component.itemsVisibles.length).toBe(0);
    });
  });

  describe('getLabelKey() / getLabelItem()', () => {
    it('debería usar la clave por rol si existe', async () => {
      await setup('ASESOR');
      const dashboard = component.navItems[0];
      expect(component.getLabelKey(dashboard)).toBe('NAV.DASHBOARD.ASESOR');
      expect(component.getLabelItem(dashboard)).toBe('Mi Panel');
    });

    it('debería usar la clave DEFAULT si el rol no tiene etiqueta propia', async () => {
      await setup('ADMINISTRADOR');
      const usuarios = component.navItems.find((i) => i.key === 'USERS')!;
      expect(component.getLabelKey(usuarios)).toBe('NAV.USERS.DEFAULT');
      expect(component.getLabelItem(usuarios)).toBe('Usuarios');
    });

    it('ASESOR debería ver "Mis Clientes" y ADMINISTRADOR "Clientes"', async () => {
      await setup('ASESOR');
      const clientes = component.navItems.find((i) => i.key === 'CLIENTS')!;
      expect(component.getLabelItem(clientes)).toBe('Mis Clientes');
    });
  });

  describe('getPathItem()', () => {
    it('ADMINISTRADOR debería ir a /dashboard/admin', async () => {
      await setup('ADMINISTRADOR');
      expect(component.getPathItem(component.navItems[0])).toBe('/dashboard/admin');
    });

    it('GERENTE debería ir a /dashboard/gerente', async () => {
      await setup('GERENTE');
      expect(component.getPathItem(component.navItems[0])).toBe('/dashboard/gerente');
    });

    it('ASESOR debería ir a /dashboard/asesor', async () => {
      await setup('ASESOR');
      expect(component.getPathItem(component.navItems[0])).toBe('/dashboard/asesor');
    });

    it('items con path fijo deben retornar ese path', async () => {
      await setup('ADMINISTRADOR');
      const clientes = component.navItems.find((i) => i.path === '/clients')!;
      expect(component.getPathItem(clientes)).toBe('/clients');
    });
  });
});
