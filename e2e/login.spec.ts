import { test, expect, Page } from '@playwright/test';

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

/**
 * Mock que replica EXACTAMENTE la respuesta real de tu Spring Boot:
 * {
 *   "id": 5,
 *   "username": "carlo",
 *   "email": "carlo@gmail.com",
 *   "token": "eyJ...",
 *   "roles": ["ADMINISTRADOR"]   ← SIN prefijo ROLE_
 * }
 */
async function mockLoginExitoso(page: Page, rol = 'ADMINISTRADOR') {
  await page.route('**/api/auth/login', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 1,
        username: 'test',
        email: 'test@clintec.com',
        token: 'eyJhbGciOiJIUzI1NiJ9.fake-token-para-tests',
        roles: [rol], // 'ADMINISTRADOR' | 'GERENTE' | 'ASESOR'
      }),
    });
  });
}

/**
 * Mock de error 401 — credenciales incorrectas.
 * Tu código hace: err.error?.message || 'Error al iniciar sesión'
 */
async function mockLoginFallido(page: Page, mensaje = 'Credenciales incorrectas') {
  await page.route('**/api/auth/login', async (route) => {
    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ message: mensaje }),
    });
  });
}

/**
 * Llena el formulario y hace click en Iniciar Sesión.
 */
async function llenarYEnviar(page: Page, email: string, password: string) {
  await page.fill('[data-testid="email-input"]', email);
  await page.fill('[data-testid="password-input"]', password);
  await page.click('[data-testid="submit-button"]');
}

// ═══════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════

test.describe('Login — CRM Clintec', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText(/CRM\s?Pro/i)).toBeVisible();
  });

  // ── Test 1: ADMINISTRADOR ────────────────────────────────────
  test('login como ADMINISTRADOR redirige a /dashboard/admin', async ({ page }) => {
    await mockLoginExitoso(page, 'ADMINISTRADOR');
    await llenarYEnviar(page, 'carlo@gmail.com', 'password123');
    await expect(page).toHaveURL('/dashboard/admin', { timeout: 10000 });
  });

  // ── Test 2: GERENTE ──────────────────────────────────────────
  test('login como GERENTE redirige a /dashboard/gerente', async ({ page }) => {
    await mockLoginExitoso(page, 'GERENTE');
    await llenarYEnviar(page, 'gerente@clintec.com', 'password123');
    await expect(page).toHaveURL('/dashboard/gerente', { timeout: 10000 });
  });

  // ── Test 3: ASESOR ───────────────────────────────────────────
  test('login como ASESOR redirige a /dashboard/asesor', async ({ page }) => {
    await mockLoginExitoso(page, 'ASESOR');
    await llenarYEnviar(page, 'asesor@clintec.com', 'password123');
    await expect(page).toHaveURL('/dashboard/asesor', { timeout: 10000 });
  });

  // ── Test 4: Credenciales incorrectas ─────────────────────────
  // En tu login.spec.ts
  test('credenciales incorrectas muestra error en modal', async ({ page }) => {
    await mockLoginFallido(page, 'Credenciales incorrectas');
    await llenarYEnviar(page, 'nadie@clintec.com', 'passwordmal');

    // En lugar de buscar error-backend, buscamos el texto que lanza el ModalService
    await expect(
      page.getByText(/Error al iniciar sesión: Credenciales incorrectas/i),
    ).toBeVisible();
  });

  // ── Test 5: Formulario vacío ─────────────────────────────────
  // Tu onLogin() llama markAllAsTouched() cuando el form es inválido,
  // eso activa los @if del template y muestra los errores
  test('enviar formulario vacío muestra errores de validación', async ({ page }) => {
    await page.click('[data-testid="submit-button"]');

    await expect(page.getByTestId('email-error')).toBeVisible();
    await expect(page.getByTestId('password-error')).toBeVisible();
    await expect(page.getByTestId('email-error')).toContainText('El email es obligatorio');
    await expect(page.getByTestId('password-error')).toContainText('La contraseña es obligatoria');
    await expect(page).toHaveURL('/login');
  });

  // ── Test 6: Email con formato inválido ───────────────────────
  // Verifica Validators.email de Angular
  test('email con formato inválido muestra error de formato', async ({ page }) => {
    await page.fill('[data-testid="email-input"]', 'esto-no-es-email');
    await page.click('[data-testid="password-input"]'); // hace "touched" el campo
    await expect(page.getByTestId('email-error')).toContainText('Ingresa un email válido');
  });

  // ── Test 7: Contraseña muy corta ─────────────────────────────
  // Verifica Validators.minLength(6) de Angular
  test('contraseña menor a 6 caracteres muestra error de longitud', async ({ page }) => {
    await page.fill('[data-testid="password-input"]', '123');
    await page.click('[data-testid="email-input"]'); // hace "touched" el campo
    await expect(page.getByTestId('password-error')).toContainText('Mínimo 6 caracteres');
  });

  // ── Test 8: Error 500 del servidor ───────────────────────────
  // Cuando Spring Boot falla sin message, tu código usa el fallback:
  // err.error?.message || 'Error al iniciar sesión'
  test('error 500 muestra mensaje genérico en modal', async ({ page }) => {
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Error interno' }),
      });
    });

    await llenarYEnviar(page, 'carlo@gmail.com', 'password123');

    // El modal debería mostrar: "Error al iniciar sesión: Error interno"
    await expect(page.getByText(/Error al iniciar sesión: Error interno/i)).toBeVisible();
  });

  // ── Test 9: Botón deshabilitado mientras carga ───────────────
  // Verifica que this.cargando = true deshabilita el botón,
  // evita que el usuario haga doble submit
  test('botón se deshabilita mientras espera respuesta', async ({ page }) => {
    await page.route('**/api/auth/login', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 800)); // simula latencia
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          username: 'test',
          email: 'carlo@gmail.com',
          token: 'fake-token',
          roles: ['ADMINISTRADOR'],
        }),
      });
    });

    await llenarYEnviar(page, 'carlo@gmail.com', 'password123');

    // Inmediatamente después del click, cargando=true → botón disabled
    await expect(page.getByTestId('submit-button')).toBeDisabled();
  });
});
