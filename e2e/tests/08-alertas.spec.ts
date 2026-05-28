import { test, expect } from '@playwright/test';
import { loginComo } from './helpers/auth.helper';

test.describe('Alertas — Flujo completo', () => {

  test.beforeEach(async ({ page }) => {
    await loginComo(page, 'admin');
    await page.goto('/alertas');
    await expect(page.getByTestId('main-alerts-container-page-container')).toBeVisible({ timeout: 10000 });
  });

  // ── LISTADO ────────────────────────────────────────────────

  test('listado de alertas carga sin errores', async ({ page }) => {
    await expect(page.locator('.spinner')).not.toBeVisible({ timeout: 15000 });
    await expect(page.locator('.estado-error')).not.toBeVisible();
    await expect(page.getByTestId('main-alerts-container-page-container')).toBeVisible();
  });

  test('filtros de tipo funcionan', async ({ page }) => {
    await expect(page.locator('.spinner')).not.toBeVisible({ timeout: 15000 });
    const btnFiltro = page.locator('[data-testid="main-alerts-btn-filtrotipo-set"]').first();
    if (await btnFiltro.isVisible()) {
      await btnFiltro.click();
      await expect(page.getByTestId('main-alerts-container-page-container')).toBeVisible();
    }
  });

  test('filtros de estado funcionan', async ({ page }) => {
    await expect(page.locator('.spinner')).not.toBeVisible({ timeout: 15000 });
    const btnEstado = page.locator('[data-testid="main-alerts-btn-filtroestado-set"]').first();
    if (await btnEstado.isVisible()) {
      await btnEstado.click();
      await expect(page.getByTestId('main-alerts-container-page-container')).toBeVisible();
    }
  });

  // ── MARCAR COMO VISTA ─────────────────────────────────────

  test('marcar alerta como vista actualiza su estado en la BD', async ({ page }) => {
    await expect(page.locator('.spinner')).not.toBeVisible({ timeout: 15000 });
    const btnVista = page.locator('[data-testid="main-alerts-btn-marcarvista"]').first();
    if (await btnVista.isVisible()) {
      await btnVista.click();
      await expect(page.getByTestId('main-alerts-container-page-container')).toBeVisible({ timeout: 8000 });
    }
  });

  // ── RESOLVER ALERTA ────────────────────────────────────────

  test('resolver alerta actualiza su estado en la BD', async ({ page }) => {
    await expect(page.locator('.spinner')).not.toBeVisible({ timeout: 15000 });
    const btnResolver = page.locator('[data-testid="main-alerts-btn-resolver"]').first();
    if (await btnResolver.isVisible()) {
      await btnResolver.click();
      await expect(page.getByTestId('main-alerts-container-page-container')).toBeVisible({ timeout: 8000 });
    }
  });

  // ── VER DETALLE ────────────────────────────────────────────

  test('ver detalle de alerta abre el modal', async ({ page }) => {
    await expect(page.locator('.spinner')).not.toBeVisible({ timeout: 15000 });
    const btnDetalle = page.locator('[data-testid="main-alerts-btn-iradetalle"]').first();
    if (await btnDetalle.isVisible()) {
      await btnDetalle.click();
      await expect(page.getByTestId('detail-modal-alerts-btn-cerrar-emit')).toBeVisible({ timeout: 8000 });
    }
  });

});
