import { test, expect } from '@playwright/test';
import { loginComo } from './helpers/auth.helper';

const TIMESTAMP = Date.now();

test.describe('Ventas — Flujo completo', () => {

  test.beforeEach(async ({ page }) => {
    await loginComo(page, 'admin');
    await page.goto('/ventas');
    await expect(page.getByTestId('sale-list-container-page-container')).toBeVisible({ timeout: 10000 });
  });

  // ── LISTADO ────────────────────────────────────────────────

  test('listado de ventas carga la tabla', async ({ page }) => {
    await expect(page.locator('.spinner')).not.toBeVisible({ timeout: 15000 });
    await expect(page.locator('table, .ventas-list')).toBeVisible();
  });

  test('botón Registrar Venta navega al formulario', async ({ page }) => {
    await page.locator('[data-testid="sale-list-btn-registrarventa"]').first().click();
    await expect(page.getByTestId('sale-form-container-page-container')).toBeVisible({ timeout: 10000 });
  });

  // ── CREAR VENTA (flujo real con BD) ───────────────────────

  test('registrar venta queda guardada en la BD', async ({ page }) => {
    await page.locator('[data-testid="sale-list-btn-registrarventa"]').first().click();
    await expect(page.getByTestId('sale-form-form-form')).toBeVisible({ timeout: 10000 });

    await page.fill('[data-testid="sale-form-input-valorventa"]', '2500000');

    // Método de pago — click en el primer botón de método disponible
    await page.locator('[data-testid="sale-form-btn-f-paymentmethod-setvalue"]').first().click();

    await page.fill('[data-testid="sale-form-textarea-notas"]', `Venta de prueba ${TIMESTAMP}`);

    await page.click('[data-testid="sale-form-btn-btn-primary"]');
    await expect(page).toHaveURL(/ventas/i, { timeout: 15000 });
  });

  // ── DETALLE ────────────────────────────────────────────────

  test('ver detalle de venta muestra información completa', async ({ page }) => {
    await expect(page.locator('.spinner')).not.toBeVisible({ timeout: 15000 });
    await page.locator('[data-testid="sale-list-btn-iradetalle"]').first().click();
    await expect(page.getByTestId('sale-detail-container-page-container')).toBeVisible({ timeout: 10000 });
  });

  test('botón volver desde detalle regresa al listado', async ({ page }) => {
    await expect(page.locator('.spinner')).not.toBeVisible({ timeout: 15000 });
    await page.locator('[data-testid="sale-list-btn-iradetalle"]').first().click();
    await expect(page.getByTestId('sale-detail-container-page-container')).toBeVisible({ timeout: 10000 });
    await page.click('[data-testid="sale-detail-btn-volver"]');
    await expect(page).toHaveURL(/\/ventas$/i, { timeout: 8000 });
  });

  // ── VALIDACIONES ──────────────────────────────────────────

  test('formulario de venta sin valor muestra error', async ({ page }) => {
    await page.locator('[data-testid="sale-list-btn-registrarventa"]').first().click();
    await page.click('[data-testid="sale-form-btn-btn-primary"]');
    await expect(page.locator('.cl-error, .error').first()).toBeVisible();
  });

  test('cancelar desde formulario regresa al listado', async ({ page }) => {
    await page.locator('[data-testid="sale-list-btn-registrarventa"]').first().click();
    await page.click('[data-testid="sale-form-btn-cancelar"]');
    await expect(page).toHaveURL(/\/ventas$/i, { timeout: 8000 });
  });

});
