import { test, expect, Page } from '@playwright/test';
import { USUARIOS } from './helpers/auth.helper';

async function mockError401(page: Page) {
  await page.route('**/api/auth/login', (route) =>
    route.fulfill({ status: 401, contentType: 'application/json',
      body: JSON.stringify({ message: 'Credenciales incorrectas' }) }),
  );
}

async function mockError500(page: Page) {
  await page.route('**/api/auth/login', (route) =>
    route.fulfill({ status: 500, contentType: 'application/json',
      body: JSON.stringify({ message: 'Error interno del servidor' }) }),
  );
}

test.describe('Login — CRM Clintec', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByTestId('email-input')).toBeVisible();
  });

  // ── FLUJOS REALES CON BACKEND ──────────────────────────────

  test('ADMIN: login exitoso redirige al dashboard', async ({ page }) => {
    await page.fill('[data-testid="email-input"]', USUARIOS.admin.email);
    await page.fill('[data-testid="password-input"]', USUARIOS.admin.password);
    await page.click('[data-testid="submit-button"]');
    await expect(page).toHaveURL(/dashboard/i, { timeout: 15000 });
  });

  test('GERENTE: login exitoso redirige al dashboard', async ({ page }) => {
    await page.fill('[data-testid="email-input"]', USUARIOS.gerente.email);
    await page.fill('[data-testid="password-input"]', USUARIOS.gerente.password);
    await page.click('[data-testid="submit-button"]');
    await expect(page).toHaveURL(/dashboard/i, { timeout: 15000 });
  });

  test('ASESOR: login exitoso redirige al dashboard', async ({ page }) => {
    await page.fill('[data-testid="email-input"]', USUARIOS.asesor.email);
    await page.fill('[data-testid="password-input"]', USUARIOS.asesor.password);
    await page.click('[data-testid="submit-button"]');
    await expect(page).toHaveURL(/dashboard/i, { timeout: 15000 });
  });

  test('logout cierra sesión y redirige a /login', async ({ page }) => {
    await page.fill('[data-testid="email-input"]', USUARIOS.admin.email);
    await page.fill('[data-testid="password-input"]', USUARIOS.admin.password);
    await page.click('[data-testid="submit-button"]');
    await page.waitForURL(/dashboard/i, { timeout: 15000 });
    await page.click('[data-testid="navbar-btn-cerrarsesion"]');
    await expect(page).toHaveURL(/login/i, { timeout: 10000 });
  });

  test('ruta protegida sin sesión redirige a /login', async ({ page }) => {
    await page.goto('/clientes');
    await expect(page).toHaveURL(/login/i, { timeout: 8000 });
  });

  // ── VALIDACIONES FRONTEND ──────────────────────────────────

  test('formulario vacío muestra errores de validación', async ({ page }) => {
    await page.click('[data-testid="submit-button"]');
    await expect(page.getByTestId('email-error')).toBeVisible();
    await expect(page.getByTestId('password-error')).toBeVisible();
    await expect(page).toHaveURL(/login/i);
  });

  test('email con formato inválido muestra error', async ({ page }) => {
    await page.fill('[data-testid="email-input"]', 'esto-no-es-email');
    await page.click('[data-testid="password-input"]');
    await expect(page.getByTestId('email-error')).toBeVisible();
  });

  test('contraseña menor a 6 caracteres muestra error', async ({ page }) => {
    await page.fill('[data-testid="password-input"]', '123');
    await page.click('[data-testid="email-input"]');
    await expect(page.getByTestId('password-error')).toBeVisible();
  });

  test('credenciales incorrectas muestra error (mock 401)', async ({ page }) => {
    await mockError401(page);
    await page.fill('[data-testid="email-input"]', 'nadie@clintec.com');
    await page.fill('[data-testid="password-input"]', 'passwordmal');
    await page.click('[data-testid="submit-button"]');
    await expect(page.getByText(/Credenciales incorrectas/i)).toBeVisible({ timeout: 8000 });
  });

  test('error 500 muestra mensaje genérico (mock 500)', async ({ page }) => {
    await mockError500(page);
    await page.fill('[data-testid="email-input"]', USUARIOS.admin.email);
    await page.fill('[data-testid="password-input"]', USUARIOS.admin.password);
    await page.click('[data-testid="submit-button"]');
    await expect(page.getByText(/Error interno/i)).toBeVisible({ timeout: 8000 });
  });

});
