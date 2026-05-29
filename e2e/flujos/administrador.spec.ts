import { test, expect, Page } from '@playwright/test';

/* =====================================================
   BASE DE DATOS FALSA
===================================================== */
const fakeDB = {
  clientes: [] as any[],
  usuarios: [] as any[],
};

test.describe('Flujo Administrador CRM (Mockeado)', () => {
  test.beforeEach(async ({ page }) => {
    fakeDB.clientes = [
      {
        id: 1,
        nombreCliente: 'Cliente Inicial',
        empresa: 'Empresa Inicial',
        email: 'inicial@test.com',
        telefono: '3001111111',
        direccion: 'Bogotá',
        fechaRegistro: '2026-01-01',
      },
    ];

    fakeDB.usuarios = [
      {
        id: 1,
        nombre: 'Admin Principal',
        email: 'admin@test.com',
        rol: 'ADMINISTRADOR',
        activo: true,
        fechaCreacion: '2026-01-01',
      },
    ];

    await configurarMocks(page);
  });

  /* ==================================================
     TEST 1 — CLIENTES
  ================================================== */
  test('login + clientes + crear cliente', async ({ page }) => {
    /* LOGIN */
    await page.goto('/login');
    await page.getByTestId('email-input').fill('admin@test.com');
    await page.getByTestId('password-input').fill('123456');
    await page.getByTestId('submit-button').click();
    await expect(page).toHaveURL(/dashboard\/admin/, { timeout: 10000 });

    /* LISTA CLIENTES */
    await page.goto('/clients');
    await expect(page.getByTestId('clients-title')).toBeVisible();
    await expect(page.getByTestId('clients-table')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('client-row-1')).toContainText('Cliente Inicial');

    /* CREAR CLIENTE */
    await page.getByTestId('new-client-btn').click();
    await expect(page).toHaveURL(/clients\/crear/);

    await page.getByTestId('input-nombre').fill('Cliente Playwright');
    await page.getByTestId('input-email').fill('cliente@test.com');
    await page.getByTestId('input-telefono').fill('3001234567');
    await page.getByTestId('input-empresa').fill('Empresa Demo');
    await page.getByTestId('input-direccion').fill('Bogotá');
    await page.getByTestId('btn-guardar').click();

    /* VALIDAR NUEVO CLIENTE EN LISTA */
    await expect(page).toHaveURL(/\/clients$/, { timeout: 10000 });
    await expect(page.getByTestId('clients-table')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('client-row-99')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('client-row-99')).toContainText('Cliente Playwright');
  });

  /* ==================================================
     TEST 2 — USUARIOS
  ================================================== */
  test('login + usuarios + crear usuario', async ({ page }) => {
    /* LOGIN */
    await page.goto('/login');
    await page.getByTestId('email-input').fill('admin@test.com');
    await page.getByTestId('password-input').fill('123456');
    await page.getByTestId('submit-button').click();
    await expect(page).toHaveURL(/dashboard\/admin/, { timeout: 10000 });

    /* LISTA USUARIOS */
    await page.goto('/users');
    await expect(page.getByTestId('users-title')).toBeVisible();
    await expect(page.getByTestId('users-table')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('user-row-1')).toContainText('Admin Principal');

    /* IR A CREAR USUARIO */
    await page.getByTestId('new-user-btn').click();
    await expect(page).toHaveURL(/users\/create/);

    /* LLENAR FORMULARIO */
    await page.getByTestId('input-nombre-usuario').fill('Usuario Playwright');
    await page.getByTestId('input-email-usuario').fill('nuevo@test.com');
    await page.getByTestId('input-password-usuario').fill('password123');
    await page.getByTestId('select-rol-usuario').selectOption('ASESOR');
    await page.getByTestId('btn-guardar-usuario').click();

    /* VALIDAR NUEVO USUARIO EN LISTA */
    await expect(page).toHaveURL(/\/users$/, { timeout: 10000 });
    await expect(page.getByTestId('users-table')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('user-row-88')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('user-row-88')).toContainText('Usuario Playwright');
    await expect(page.getByTestId('user-row-88')).toContainText('ASESOR');
  });
});

/* =====================================================
   MOCKS
===================================================== */
async function configurarMocks(page: Page) {
  /* LOGIN */
  await page.route('**/auth/login**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 1,
        username: 'admin',
        email: 'admin@test.com',
        token: 'fake-token',
        roles: ['ADMINISTRADOR'],
      }),
    });
  });

  /* CLIENTES */
  await page.route('**/clientes**', async (route, request) => {
    const method = request.method();
    console.log('[MOCK] clientes:', method, request.url());

    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(fakeDB.clientes),
      });
      return;
    }

    if (method === 'POST') {
      const nuevo = JSON.parse(request.postData() || '{}');
      nuevo.id = 99;
      nuevo.fechaRegistro = '2026-01-10';
      fakeDB.clientes.push(nuevo);
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(nuevo),
      });
      return;
    }

    await route.continue();
  });

  /* USUARIOS — GET lista y POST crear */
  await page.route('**/usuarios**', async (route, request) => {
    const method = request.method();
    const url = request.url();
    console.log('[MOCK] usuarios:', method, url);

    // GET lista base: /usuarios (sin segmentos extra)
    if (method === 'GET' && /\/usuarios$/.test(url)) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(fakeDB.usuarios),
      });
      return;
    }

    // POST crear usuario
    if (method === 'POST') {
      const nuevo = JSON.parse(request.postData() || '{}');
      const creado = {
        id: 88,
        nombre: nuevo.nombre,
        email: nuevo.email,
        rol: nuevo.rol,
        activo: true,
        fechaCreacion: '2026-05-28',
      };
      fakeDB.usuarios.push(creado);
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(creado),
      });
      return;
    }

    await route.continue();
  });

  /* OPORTUNIDADES */
  await page.route('**/oportunidades**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });

  /* CALIFICACIONES */
  await page.route('**/calificaciones**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });

  /* DASHBOARD */
  await page.route('**/dashboard**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({}),
    });
  });
}
