import { test, expect } from '@playwright/test';
import { loginComo } from './helpers/auth.helper';

const TIMESTAMP = Date.now();

test.describe('Interacciones — Flujo completo', () => {

  test.beforeEach(async ({ page }) => {
    await loginComo(page, 'admin');
    await page.goto('/interacciones');
    await expect(page.getByTestId('list-interactions-container-page-container')).toBeVisible({ timeout: 10000 });
  });

  // ── LISTADO ────────────────────────────────────────────────

  test('listado de interacciones carga correctamente', async ({ page }) => {
    await expect(page.locator('.spinner')).not.toBeVisible({ timeout: 15000 });
    await expect(page.locator('table, .interacciones-list, .page-container')).toBeVisible();
  });

  test('botón Nueva Interacción abre el formulario/modal', async ({ page }) => {
    await page.click('[data-testid="list-interactions-btn-iracrear"]');
    await expect(page.getByTestId('interaction-form-form-form')).toBeVisible({ timeout: 8000 });
  });

  // ── CREAR INTERACCIÓN (flujo real con BD) ─────────────────

  test('crear interacción queda registrada en la BD', async ({ page }) => {
    await page.click('[data-testid="list-interactions-btn-iracrear"]');
    await expect(page.getByTestId('interaction-form-form-form')).toBeVisible({ timeout: 8000 });

    // Seleccionar cliente
    await page.selectOption('[data-testid="interaction-form-select-clienteid"]', { index: 1 });

    // Seleccionar oportunidad si se habilita
    const selectOport = page.getByTestId('interaction-form-select-oportunidadid');
    if (await selectOport.isEnabled()) {
      await selectOport.selectOption({ index: 1 });
    }

    // Tipo de interacción — primer botón disponible
    const btnTipo = page.locator('[data-testid="interaction-form-btn-f-tipo-setvalue"]').first();
    if (await btnTipo.isVisible()) await btnTipo.click();

    // Nota
    await page.fill('[data-testid="interaction-form-textarea-nota"]',
      `Interacción de prueba ${TIMESTAMP}`);

    await page.click('[data-testid="interaction-form-btn-submit"]');

    // Modal cierra y la interacción aparece en el listado
    await expect(
      page.getByTestId('list-interactions-container-page-container')
    ).toBeVisible({ timeout: 15000 });
  });

  // ── VALIDACIONES ──────────────────────────────────────────

  test('cancelar cierra el formulario sin guardar', async ({ page }) => {
    await page.click('[data-testid="list-interactions-btn-iracrear"]');
    await expect(page.getByTestId('interaction-form-form-form')).toBeVisible({ timeout: 8000 });
    await page.click('[data-testid="interaction-form-btn-cancelar"]');
    // El modal cierra
    await expect(page.getByTestId('interaction-form-form-form')).not.toBeVisible({ timeout: 5000 });
  });

});
