import { test, expect } from '@playwright/test';
import { loginComo } from './helpers/auth.helper';

const TIMESTAMP = Date.now();

// ════════════════════════════════════════════════════════════
// FLUJOS COMPLETOS DEL SISTEMA — CRM Clintec
// Validan el ciclo completo: frontend → backend → base de datos
// ════════════════════════════════════════════════════════════

test.describe('Flujo 1: Ciclo de vida de un cliente', () => {

  test('crear cliente → aparece en listado → ver detalle → editar', async ({ page }) => {
    await loginComo(page, 'admin');

    const nombreCliente = `Cliente Flujo ${TIMESTAMP}`;
    const emailCliente  = `flujo.${TIMESTAMP}@test.com`;

    // PASO 1: Crear cliente
    await page.goto('/clientes/nuevo');
    await expect(page.getByTestId('client-form')).toBeVisible();
    await page.fill('[data-testid="input-nombre"]',   nombreCliente);
    await page.fill('[data-testid="input-email"]',    emailCliente);
    await page.fill('[data-testid="input-telefono"]', '3009876543');
    await page.click('[data-testid="btn-guardar"]');

    // PASO 2: Verificar en listado (= BD persistió el dato)
    await expect(page).toHaveURL(/\/clientes$/i, { timeout: 15000 });
    await expect(page.getByText(nombreCliente)).toBeVisible({ timeout: 10000 });

    // PASO 3: Ver detalle
    const fila = page.locator('tr', { hasText: nombreCliente });
    await fila.locator('[data-testid^="view-client-"]').click();
    await expect(page.getByTestId('detail-card')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('detail-nombre')).toContainText(nombreCliente);
    await expect(page.getByTestId('detail-email')).toContainText(emailCliente);

    // PASO 4: Volver y editar
    await page.click('[data-testid="btn-volver"]');
    await page.locator('tr', { hasText: nombreCliente })
              .locator('[data-testid^="edit-client-"]').click();
    await expect(page.getByTestId('client-form-title')).toContainText('Editar cliente');
    await page.fill('[data-testid="input-empresa"]', `Empresa Actualizada ${TIMESTAMP}`);
    await page.click('[data-testid="btn-guardar"]');
    await expect(page).toHaveURL(/\/clientes$/i, { timeout: 15000 });
  });

});

test.describe('Flujo 2: Gestión de usuarios', () => {

  test('crear usuario → listado → toggle estado activo/inactivo', async ({ page }) => {
    await loginComo(page, 'admin');

    const nombreUsuario = `Asesor Flujo ${TIMESTAMP}`;
    const emailUsuario  = `asesor.flujo.${TIMESTAMP}@clintec.com`;

    // PASO 1: Crear usuario
    await page.goto('/usuarios');
    await page.click('[data-testid="users-btn-iracrear"]');
    await page.fill('[data-testid="user-form-input-nombre"]',   nombreUsuario);
    await page.fill('[data-testid="user-form-input-email"]',    emailUsuario);
    await page.fill('[data-testid="user-form-input-password"]', 'Password123');
    await page.selectOption('[data-testid="user-form-select-rol"]', { value: 'ASESOR' });
    await page.click('[data-testid="user-form-btn-btn-primary"]');

    // PASO 2: Aparece en listado
    await expect(page).toHaveURL(/\/usuarios$/i, { timeout: 15000 });
    await expect(page.getByText(nombreUsuario)).toBeVisible({ timeout: 10000 });

    // PASO 3: Desactivar
    const filaUsuario = page.locator('tr', { hasText: nombreUsuario });
    await filaUsuario.locator('[data-testid="users-btn-toggleestado"]').click();
    await expect(filaUsuario.locator('.badge-inactivo')).toBeVisible({ timeout: 10000 });

    // PASO 4: Activar de nuevo
    await filaUsuario.locator('[data-testid="users-btn-toggleestado"]').click();
    await expect(filaUsuario.locator('.badge-activo')).toBeVisible({ timeout: 10000 });
  });

});

test.describe('Flujo 3: Dashboard con datos reales', () => {

  test('dashboard admin refleja datos reales del sistema', async ({ page }) => {
    await loginComo(page, 'admin');

    await expect(page.getByTestId('admin-dashboard')).toBeVisible();
    await expect(page.getByTestId('dashboard-loading')).not.toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('dashboard-error')).not.toBeVisible();

    // KPIs tienen valores numéricos reales
    await expect(page.getByTestId('value-clientes')).not.toBeEmpty();
    await expect(page.getByTestId('value-usuarios')).not.toBeEmpty();

    // Funnel de ventas visible
    await expect(page.getByTestId('dashboard-summary')).toBeVisible();

    // Navegar a clientes desde sidebar
    await page.click('[data-testid="menu-clientes"]');
    await expect(page).toHaveURL(/clientes/i, { timeout: 8000 });
    await expect(page.getByTestId('clients-title')).toBeVisible();
  });

  test('sidebar muestra solo opciones del rol del usuario', async ({ page }) => {
    await loginComo(page, 'asesor');
    // El asesor no debe ver gestión de usuarios
    await expect(page.locator('[data-testid="menu-usuarios"]')).not.toBeVisible();
  });

});

test.describe('Flujo 4: Seguridad y control de acceso', () => {

  test('usuario sin sesión no puede acceder a rutas protegidas', async ({ page }) => {
    const rutas = ['/clientes', '/usuarios', '/oportunidades', '/ventas', '/alertas'];
    for (const ruta of rutas) {
      await page.goto(ruta);
      await expect(page).toHaveURL(/login/i, { timeout: 8000 });
    }
  });

  test('cerrar sesión limpia el token y redirige a login', async ({ page }) => {
    await loginComo(page, 'admin');

    // Token existe en localStorage
    const token = await page.evaluate(() => localStorage.getItem('clintec_token'));
    expect(token).not.toBeNull();

    // Cerrar sesión con el botón del navbar
    await page.click('[data-testid="navbar-btn-cerrarsesion"]');
    await expect(page).toHaveURL(/login/i, { timeout: 10000 });

    // Token eliminado
    const tokenDespues = await page.evaluate(() => localStorage.getItem('clintec_token'));
    expect(tokenDespues).toBeNull();
  });

});
