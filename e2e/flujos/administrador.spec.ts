import { test, expect, Page } from '@playwright/test';

/**
 * Base de datos falsa en memoria para mocks
 */
const fakeDB = {
  clientes: [] as any[],
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

    await configurarMocks(page);
  });

  test('login + dashboard + clientes + crear cliente', async ({ page }) => {
    /* LOGIN */
    await page.goto('/login');

    await page.getByTestId('email-input').fill('admin@test.com');
    await page.getByTestId('password-input').fill('123456');
    await page.getByTestId('submit-button').click();

    await expect(page).toHaveURL(/dashboard\/admin/, {
      timeout: 10000,
    });

    /* CLIENTES */
    await page.goto('/clients');

    await expect(page.getByTestId('clients-title')).toBeVisible();

    await expect(page.getByTestId('clients-table')).toBeVisible({
      timeout: 10000,
    });

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

    /* VALIDAR NUEVO CLIENTE */
    await expect(page).toHaveURL(/\/clients$/);

    await expect(page.getByTestId('client-row-99')).toBeVisible();

    await expect(page.getByTestId('client-row-99')).toContainText('Cliente Playwright');
  });
});

/* =====================================================
   MOCKS
===================================================== */
async function configurarMocks(page: Page) {
  /* LOGIN */
  await page.route(/.*auth\/login.*/, async (route) => {
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
  await page.route(/.*clientes.*/, async (route, request) => {
    const method = request.method();

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
  });

  /* OPORTUNIDADES (forkJoin necesario) */
  await page.route(/.*oportunidades.*/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });

  /* DASHBOARD opcional */
  await page.route(/.*dashboard.*/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({}),
    });
  });
}
