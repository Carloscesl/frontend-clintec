import { test, expect, Page, APIRequestContext } from '@playwright/test';

/* =====================================================
   CONFIGURACIÓN — ajusta estas variables a tu entorno
===================================================== */
const BASE_URL = process.env.BASE_URL ?? 'http://localhost:4200';
const API_URL = process.env.API_URL ?? 'http://localhost:8080/api';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@test.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? '123456';

/* Datos únicos por ejecución para no colisionar en BD */
const RUN_ID = Date.now();
const CLIENTE_EMAIL = `cliente_pw_${RUN_ID}@test.com`;
const USUARIO_EMAIL = `usuario_pw_${RUN_ID}@test.com`;

/* =====================================================
   HELPERS
===================================================== */

/**
 * Obtiene un JWT directamente de la API (sin UI).
 * Ajusta la ruta al token según tu respuesta real:
 *   body.token | body.accessToken | body.data.token
 */
async function obtenerToken(request: APIRequestContext): Promise<string> {
  const res = await request.post(`${API_URL}/auth/login`, {
    data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  });
  expect(
    res.status(),
    'Login de setup falló — revisa credenciales o que el backend esté corriendo',
  ).toBe(200);
  const body = await res.json();
  const token = body.token ?? body.accessToken ?? body.data?.token;
  expect(token, 'No se encontró token en la respuesta del login').toBeTruthy();
  return token as string;
}

/** Elimina un cliente de la BD por ID vía API (limpieza post-test). */
async function eliminarCliente(request: APIRequestContext, token: string, id: number) {
  await request.delete(`${API_URL}/clientes/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

/** Elimina un usuario de la BD por ID vía API (limpieza post-test). */
async function eliminarUsuario(request: APIRequestContext, token: string, id: number) {
  await request.delete(`${API_URL}/usuarios/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

/** Inicia sesión desde la UI y espera redirección al dashboard. */
async function loginUI(page: Page) {
  await page.goto(`${BASE_URL}/login`);
  await page.getByTestId('email-input').fill(ADMIN_EMAIL);
  await page.getByTestId('password-input').fill(ADMIN_PASSWORD);
  await page.getByTestId('submit-button').click();
  await expect(page).toHaveURL(/dashboard\/admin/, { timeout: 15_000 });
}

/* =====================================================
   SUITE PRINCIPAL
===================================================== */
test.describe('Flujo Administrador CRM — Datos Reales', () => {
  let token = '';

  test.beforeAll(async ({ request }) => {
    token = await obtenerToken(request);
  });

  /* --------------------------------------------------
     TEST 1 — LOGIN + CLIENTES
  -------------------------------------------------- */
  test('login + clientes + crear cliente (real)', async ({ page, request }) => {
    let clienteId: number | null = null;

    try {
      /* ── LOGIN UI ── */
      await loginUI(page);

      /* ── LISTA DE CLIENTES ── */
      await page.goto(`${BASE_URL}/clients`);
      await expect(page.getByTestId('clients-title')).toBeVisible();
      await expect(page.getByTestId('clients-table')).toBeVisible({ timeout: 15_000 });

      // Verificamos que la tabla no esté vacía (al menos 1 fila renderizada)
      const filasIniciales = page.locator('[data-testid^="client-row-"]');
      await expect(filasIniciales.first()).toBeVisible({ timeout: 10_000 });

      /* ── CREAR CLIENTE ── */
      await page.getByTestId('new-client-btn').click();
      await expect(page).toHaveURL(/clients\/crear/);

      await page.getByTestId('input-nombre').fill(`Cliente Playwright ${RUN_ID}`);
      await page.getByTestId('input-email').fill(CLIENTE_EMAIL);
      await page.getByTestId('input-telefono').fill('3001234567');
      await page.getByTestId('input-empresa').fill('Empresa Demo E2E');
      await page.getByTestId('input-direccion').fill('Bogotá');
      await page.getByTestId('btn-guardar').click();

      /* ── VALIDAR REDIRECCIÓN Y PRESENCIA EN LISTA ── */
      await expect(page).toHaveURL(/\/clients$/, { timeout: 15_000 });
      await expect(page.getByTestId('clients-table')).toBeVisible({ timeout: 15_000 });

      // Buscamos la fila por texto (el ID real lo asigna la BD)
      const filaCliente = page.locator('[data-testid^="client-row-"]', {
        hasText: `Cliente Playwright ${RUN_ID}`,
      });
      await expect(filaCliente).toBeVisible({ timeout: 15_000 });

      /* ── VALIDAR PERSISTENCIA EN BD VÍA API ── */
      const resGet = await request.get(`${API_URL}/clientes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(resGet.status()).toBe(200);

      const clientes: any[] = await resGet.json();
      const clienteCreado = clientes.find((c) => c.email === CLIENTE_EMAIL);
      expect(clienteCreado, `Cliente ${CLIENTE_EMAIL} no encontrado en la BD`).toBeTruthy();
      clienteId = clienteCreado.id;

      // Ajusta el campo nombre según tu entidad real: nombreCliente | nombre
      expect(clienteCreado.nombreCliente ?? clienteCreado.nombre).toContain(
        `Cliente Playwright ${RUN_ID}`,
      );
      expect(clienteCreado.empresa).toBe('Empresa Demo E2E');
    } finally {
      /* LIMPIEZA — borra el cliente de prueba de la BD */
      if (clienteId) {
        await eliminarCliente(request, token, clienteId);
        console.log(`[CLEANUP] Cliente ${clienteId} eliminado de la BD`);
      }
    }
  });

  /* --------------------------------------------------
     TEST 2 — LOGIN + USUARIOS
  -------------------------------------------------- */
  test('login + usuarios + crear usuario (real)', async ({ page, request }) => {
    let usuarioId: number | null = null;

    try {
      /* ── LOGIN UI ── */
      await loginUI(page);

      /* ── LISTA DE USUARIOS ── */
      await page.goto(`${BASE_URL}/users`);
      await expect(page.getByTestId('users-title')).toBeVisible();
      await expect(page.getByTestId('users-table')).toBeVisible({ timeout: 15_000 });

      // Verificamos que haya al menos un usuario (el admin)
      const filasIniciales = page.locator('[data-testid^="user-row-"]');
      await expect(filasIniciales.first()).toBeVisible({ timeout: 10_000 });

      /* ── CREAR USUARIO ── */
      await page.getByTestId('new-user-btn').click();
      await expect(page).toHaveURL(/users\/create/);

      await page.getByTestId('input-nombre-usuario').fill(`Usuario Playwright ${RUN_ID}`);
      await page.getByTestId('input-email-usuario').fill(USUARIO_EMAIL);
      await page.getByTestId('input-password-usuario').fill('Password123!');
      await page.getByTestId('select-rol-usuario').selectOption('ASESOR');
      await page.getByTestId('btn-guardar-usuario').click();

      /* ── VALIDAR REDIRECCIÓN Y PRESENCIA EN LISTA ── */
      await expect(page).toHaveURL(/\/users$/, { timeout: 15_000 });
      await expect(page.getByTestId('users-table')).toBeVisible({ timeout: 15_000 });

      const filaUsuario = page.locator('[data-testid^="user-row-"]', {
        hasText: `Usuario Playwright ${RUN_ID}`,
      });
      await expect(filaUsuario).toBeVisible({ timeout: 15_000 });
      await expect(filaUsuario).toContainText('ASESOR');

      /* ── VALIDAR PERSISTENCIA EN BD VÍA API ── */
      const resGet = await request.get(`${API_URL}/usuarios`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(resGet.status()).toBe(200);

      const usuarios: any[] = await resGet.json();
      const usuarioCreado = usuarios.find((u) => u.email === USUARIO_EMAIL);
      expect(usuarioCreado, `Usuario ${USUARIO_EMAIL} no encontrado en la BD`).toBeTruthy();
      usuarioId = usuarioCreado.id;

      expect(usuarioCreado.nombre).toContain(`Usuario Playwright ${RUN_ID}`);
      expect(usuarioCreado.rol).toBe('ASESOR');
      expect(usuarioCreado.activo).toBe(true);
    } finally {
      /* LIMPIEZA — borra el usuario de prueba de la BD */
      if (usuarioId) {
        await eliminarUsuario(request, token, usuarioId);
        console.log(`[CLEANUP] Usuario ${usuarioId} eliminado de la BD`);
      }
    }
  });
});
