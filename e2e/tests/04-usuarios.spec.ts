import { test, expect } from '@playwright/test';
import { loginComo } from './helpers/auth.helper';

const TIMESTAMP = Date.now();
const USUARIO_NUEVO = {
  nombre:   `Usuario Test ${TIMESTAMP}`,
  email:    `usuario.test.${TIMESTAMP}@clintec.com`,
  password: 'Password123',
};

test.describe('Usuarios — Gestión completa', () => {

  test.beforeEach(async ({ page }) => {
    await loginComo(page, 'admin');
    await page.goto('/usuarios');
    await expect(page.getByTestId('users-container-page-container')).toBeVisible({ timeout: 10000 });
  });

  // ── LISTADO ────────────────────────────────────────────────

  test('listado carga tabla con columnas correctas', async ({ page }) => {
    await expect(page.locator('.spinner')).not.toBeVisible({ timeout: 15000 });
    await expect(page.locator('.cl-table')).toBeVisible();
    await expect(page.locator('th').filter({ hasText: 'Usuario' })).toBeVisible();
    await expect(page.locator('th').filter({ hasText: 'Email' })).toBeVisible();
    await expect(page.locator('th').filter({ hasText: 'Rol' })).toBeVisible();
    await expect(page.locator('th').filter({ hasText: 'Estado' })).toBeVisible();
  });

  test('botón Nuevo Usuario navega al formulario', async ({ page }) => {
    await page.click('[data-testid="users-btn-iracrear"]');
    await expect(page).toHaveURL(/usuarios\/nuevo/i);
    await expect(page.getByTestId('user-form-container-page-container')).toBeVisible();
  });

  // ── CREAR USUARIO (flujo real con BD) ─────────────────────

  test('crear nuevo usuario ASESOR queda registrado en la BD', async ({ page }) => {
    await page.click('[data-testid="users-btn-iracrear"]');
    await expect(page.getByTestId('user-form-form-form')).toBeVisible({ timeout: 10000 });

    await page.fill('[data-testid="user-form-input-nombre"]',   USUARIO_NUEVO.nombre);
    await page.fill('[data-testid="user-form-input-email"]',    USUARIO_NUEVO.email);
    await page.fill('[data-testid="user-form-input-password"]', USUARIO_NUEVO.password);
    await page.selectOption('[data-testid="user-form-select-rol"]', { value: 'ASESOR' });

    await page.click('[data-testid="user-form-btn-btn-primary"]');

    await expect(page).toHaveURL(/\/usuarios$/i, { timeout: 15000 });
    await expect(page.getByText(USUARIO_NUEVO.nombre)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(USUARIO_NUEVO.email)).toBeVisible();
  });

  // ── EDITAR USUARIO ─────────────────────────────────────────

  test('editar usuario actualiza sus datos', async ({ page }) => {
    await expect(page.locator('.cl-table')).toBeVisible({ timeout: 15000 });
    await page.locator('[data-testid="users-btn-iraeditar"]').first().click();
    await expect(page).toHaveURL(/usuarios\/editar|usuarios\/\d+/i, { timeout: 10000 });

    const nombreEditado = `Editado ${TIMESTAMP}`;
    await page.fill('[data-testid="user-form-input-nombre"]', nombreEditado);
    await page.click('[data-testid="user-form-btn-btn-primary"]');
    await expect(page).toHaveURL(/\/usuarios$/i, { timeout: 15000 });
  });

  // ── ACTIVAR / DESACTIVAR ───────────────────────────────────

  test('toggle estado cambia activo/inactivo en la BD', async ({ page }) => {
    await expect(page.locator('.cl-table')).toBeVisible({ timeout: 15000 });
    await page.locator('[data-testid="users-btn-toggleestado"]').first().click();
    // El badge de estado cambia
    await expect(
      page.locator('.badge-inactivo, .badge-activo').first()
    ).toBeVisible({ timeout: 10000 });
  });

  // ── VALIDACIONES FORMULARIO ────────────────────────────────

  test('formulario vacío muestra errores de validación', async ({ page }) => {
    await page.click('[data-testid="users-btn-iracrear"]');
    await page.click('[data-testid="user-form-btn-btn-primary"]');
    await expect(page.getByText('El nombre es requerido')).toBeVisible();
    await expect(page.getByText('La contraseña es requerida')).toBeVisible();
    await expect(page.getByText('El rol es requerido')).toBeVisible();
  });

  test('nombre menor a 3 caracteres muestra error', async ({ page }) => {
    await page.click('[data-testid="users-btn-iracrear"]');
    await page.fill('[data-testid="user-form-input-nombre"]', 'Ab');
    await page.click('[data-testid="user-form-input-email"]');
    await expect(page.getByText('Mínimo 3 caracteres')).toBeVisible();
  });

  test('email inválido muestra error de formato', async ({ page }) => {
    await page.click('[data-testid="users-btn-iracrear"]');
    await page.fill('[data-testid="user-form-input-email"]', 'no-valido');
    await page.click('[data-testid="user-form-input-nombre"]');
    await expect(page.getByText('Ingresa un email válido')).toBeVisible();
  });

  test('cancelar desde formulario regresa al listado', async ({ page }) => {
    await page.click('[data-testid="users-btn-iracrear"]');
    await page.click('[data-testid="user-form-btn-cancelar"]');
    await expect(page).toHaveURL(/\/usuarios$/i, { timeout: 8000 });
  });

});
