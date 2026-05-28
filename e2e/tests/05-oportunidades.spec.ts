import { test, expect } from '@playwright/test';
import { loginComo } from './helpers/auth.helper';

const TIMESTAMP = Date.now();

test.describe('Oportunidades — Flujo completo', () => {

  test.beforeEach(async ({ page }) => {
    await loginComo(page, 'admin');
    await page.goto('/oportunidades');
    await expect(page.getByTestId('opportunity-main-container-page-container')).toBeVisible({ timeout: 10000 });
  });

  // ── LISTADO ────────────────────────────────────────────────

  test('listado de oportunidades carga correctamente', async ({ page }) => {
    await expect(page.locator('.spinner')).not.toBeVisible({ timeout: 15000 });
    await expect(page.locator('.cl-table, .oportunidades-list, .kanban')).toBeVisible();
  });

  test('botón Nueva Oportunidad navega al formulario', async ({ page }) => {
    await page.click('[data-testid="opportunity-main-btn-iracrear"]');
    await expect(page.getByTestId('opportunity-form-container-page-container')).toBeVisible({ timeout: 10000 });
  });

  // ── CREAR OPORTUNIDAD (flujo real con BD) ─────────────────

  test('crear oportunidad queda registrada en la BD', async ({ page }) => {
    await page.click('[data-testid="opportunity-main-btn-iracrear"]');
    await expect(page.getByTestId('opportunity-form-form-form')).toBeVisible({ timeout: 10000 });

    await page.selectOption('[data-testid="opportunity-form-select-clienteid"]', { index: 1 });
    await page.selectOption('[data-testid="opportunity-form-select-asesorid"]',  { index: 1 });
    await page.fill('[data-testid="opportunity-form-textarea-descripcion"]', `Oportunidad prueba ${TIMESTAMP}`);
    await page.fill('[data-testid="opportunity-form-input-valorestimado"]', '5000000');
    await page.fill('[data-testid="opportunity-form-input-fechacierreestimada"]', '2026-12-31');

    await page.click('[data-testid="opportunity-form-btn-btn-primary"]');
    await expect(page).toHaveURL(/oportunidades/i, { timeout: 15000 });
  });

  // ── VALIDACIONES ───────────────────────────────────────────

  test('formulario vacío muestra errores de validación', async ({ page }) => {
    await page.click('[data-testid="opportunity-main-btn-iracrear"]');
    await page.click('[data-testid="opportunity-form-btn-btn-primary"]');
    await expect(page.locator('.cl-error').first()).toBeVisible();
  });

  test('cancelar desde formulario regresa al listado', async ({ page }) => {
    await page.click('[data-testid="opportunity-main-btn-iracrear"]');
    await page.click('[data-testid="opportunity-form-btn-cancelar"]');
    await expect(page).toHaveURL(/oportunidades/i, { timeout: 8000 });
  });

});
