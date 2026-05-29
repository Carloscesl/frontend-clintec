import { test, expect, Page } from '@playwright/test';

/* =====================================================
   BASE DE DATOS FALSA
===================================================== */
const fakeDB = {
  clientes: [] as any[],
  oportunidades: [] as any[],
  interacciones: [] as any[],
  ventas: [] as any[],
};

const ASESOR_MOCK = {
  id: 10,
  nombre: 'Asesor Demo',
  email: 'asesor@test.com',
  rol: 'ASESOR',
  activo: true,
  fechaCreacion: '2026-01-01',
};

const INTERACCIONES_MOCK = [
  {
    id: 1,
    clienteId: 1,
    usuarioId: 10,
    oportunidadId: 55,
    tipo: 'LLAMADA',
    nota: 'Llamada inicial con el cliente para presentar propuesta',
    fecha: '2026-05-01T10:00:00.000Z',
    fechaActualizacion: '2026-05-01T10:00:00.000Z',
  },
  {
    id: 2,
    clienteId: 1,
    usuarioId: 10,
    oportunidadId: 55,
    tipo: 'REUNION',
    nota: 'Reunión presencial para revisar términos del contrato',
    fecha: '2026-05-10T14:00:00.000Z',
    fechaActualizacion: '2026-05-10T14:00:00.000Z',
  },
  {
    id: 3,
    clienteId: 1,
    usuarioId: 10,
    oportunidadId: 55,
    tipo: 'EMAIL',
    nota: 'Envío de propuesta formal por correo electrónico',
    fecha: '2026-05-15T09:00:00.000Z',
    fechaActualizacion: '2026-05-15T09:00:00.000Z',
  },
];

const VENTAS_MOCK = [
  {
    idVenta: 101,
    idOportunidad: 55,
    idAsesor: 10,
    valorVenta: 8000000,
    paymentMethod: 'TRANSFERENCIA',
    notas: 'Venta cerrada con condiciones estándar',
    fechaVenta: '2026-05-20T16:00:00.000Z',
    fechaActualizacion: '2026-05-20T16:00:00.000Z',
  },
  {
    idVenta: 102,
    idOportunidad: 56,
    idAsesor: 10,
    valorVenta: 3500000,
    paymentMethod: 'EFECTIVO',
    notas: 'Pago en efectivo acordado con el cliente',
    fechaVenta: '2026-05-22T11:00:00.000Z',
    fechaActualizacion: '2026-05-22T11:00:00.000Z',
  },
];

test.describe('Flujo Gerente CRM (Mockeado)', () => {
  test.beforeEach(async ({ page }) => {
    fakeDB.clientes = [
      {
        id: 1,
        nombreCliente: 'Cliente Existente',
        empresa: 'Empresa Existente',
        email: 'existente@test.com',
        telefono: '3009999999',
        direccion: 'Medellín',
        fechaRegistro: '2026-01-01',
      },
    ];
    fakeDB.oportunidades = [];
    fakeDB.interacciones = [...INTERACCIONES_MOCK];
    fakeDB.ventas = [...VENTAS_MOCK];

    await configurarMocks(page);
  });

  test('login + crear cliente + crear oportunidad asignada a asesor + ver interacciones + ver ventas', async ({
    page,
  }) => {
    /* ── LOGIN ── */
    await page.goto('/login');
    await page.getByTestId('email-input').fill('gerente@test.com');
    await page.getByTestId('password-input').fill('123456');
    await page.getByTestId('submit-button').click();
    await expect(page).toHaveURL(/dashboard\/gerente/, { timeout: 10000 });

    /* ── CREAR CLIENTE ── */
    await page.goto('/clients');
    await expect(page.getByTestId('clients-title')).toBeVisible();
    await expect(page.getByTestId('clients-table')).toBeVisible({ timeout: 10000 });

    await page.getByTestId('new-client-btn').click();
    await expect(page).toHaveURL(/clients\/crear/);

    await page.getByTestId('input-nombre').fill('Cliente Gerente PW');
    await page.getByTestId('input-email').fill('gerentepw@test.com');
    await page.getByTestId('input-telefono').fill('3007654321');
    await page.getByTestId('input-empresa').fill('Empresa Gerente');
    await page.getByTestId('input-direccion').fill('Cali');
    await page.getByTestId('btn-guardar').click();

    /* Validar nuevo cliente en lista */
    await expect(page).toHaveURL(/\/clients$/, { timeout: 10000 });
    await expect(page.getByTestId('clients-table')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('client-row-77')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('client-row-77')).toContainText('Cliente Gerente PW');

    /* ── CREAR OPORTUNIDAD ── */
    await page.goto('/opportunities');
    await expect(page.getByTestId('opportunities-title')).toBeVisible();
    await expect(page.getByTestId('asesores-grid')).toBeVisible({ timeout: 10000 });

    await page.getByTestId('new-opportunity-btn').click();
    await expect(page).toHaveURL(/opportunities\/crear/);

    await expect(
      page.locator('[data-testid="select-cliente-oportunidad"] option[value="77"]'),
    ).toBeAttached({ timeout: 10000 });

    await expect(
      page.locator('[data-testid="select-asesor-oportunidad"] option[value="10"]'),
    ).toBeAttached({ timeout: 10000 });

    await page.getByTestId('select-cliente-oportunidad').selectOption('77');
    await page.getByTestId('select-asesor-oportunidad').selectOption('10');

    await page
      .getByTestId('input-descripcion-oportunidad')
      .fill('Oportunidad creada por Playwright para prueba E2E');
    await page.getByTestId('input-valor-oportunidad').fill('8000000');
    await page.getByTestId('input-fecha-oportunidad').fill('2026-12-31');

    await page.getByTestId('btn-guardar-oportunidad').click();

    /* Validar redirect a lista de oportunidades */
    await expect(page).toHaveURL(/\/opportunities$/, { timeout: 10000 });
    await expect(page.getByTestId('asesores-grid')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('asesor-card-10')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('op-card-55')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('op-descripcion-55')).toContainText(
      'Oportunidad creada por Playwright',
    );

    /* ── VER LISTA DE INTERACCIONES ── */
    await page.goto('/interactions');
    await expect(page.getByTestId('interactions-title')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('interactions-timeline')).toBeVisible({ timeout: 10000 });

    // Validar que las 3 interacciones mock aparecen
    await expect(page.getByTestId('interaction-item-1')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('interaction-tipo-1')).toContainText('LLAMADA');

    await expect(page.getByTestId('interaction-item-2')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('interaction-tipo-2')).toContainText('REUNION');

    await expect(page.getByTestId('interaction-item-3')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('interaction-tipo-3')).toContainText('EMAIL');

    /* ── VER LISTA DE VENTAS ── */
    await page.goto('/sales');
    await expect(page.getByTestId('sales-title')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('sales-kpi-grid')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('kpi-total-ventas')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('sales-table')).toBeVisible({ timeout: 10000 });

    // Validar las 2 ventas mock
    await expect(page.getByTestId('sale-row-101')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('sale-valor-101')).toContainText('8,000,000');

    await expect(page.getByTestId('sale-row-102')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId('sale-valor-102')).toContainText('3,500,000');
  });
});

/* =====================================================
   MOCKS
===================================================== */
async function configurarMocks(page: Page) {
  /* LOGIN — gerente */
  await page.route('**/auth/login**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 2,
        username: 'gerente',
        email: 'gerente@test.com',
        token: 'fake-token-gerente',
        roles: ['GERENTE'],
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
      nuevo.id = 77;
      nuevo.fechaRegistro = '2026-05-28';
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

  /* USUARIOS */
  await page.route('**/usuarios**', async (route, request) => {
    const method = request.method();
    const url = request.url();
    console.log('[MOCK] usuarios:', method, url);

    if (method === 'GET' && url.includes('filtrar')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([ASESOR_MOCK]),
      });
      return;
    }

    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([ASESOR_MOCK]),
      });
      return;
    }

    await route.continue();
  });

  /* OPORTUNIDADES */
  await page.route('**/oportunidades**', async (route, request) => {
    const method = request.method();
    const url = request.url();
    console.log('[MOCK] oportunidades:', method, url);

    if (method === 'GET' && url.includes('idasesor')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(
          fakeDB.oportunidades.filter((op) => String(op.asesorId) === url.split('idasesor/')[1]),
        ),
      });
      return;
    }

    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(fakeDB.oportunidades),
      });
      return;
    }

    if (method === 'POST') {
      const nueva = JSON.parse(request.postData() || '{}');
      const creada = {
        idOportunidad: 55,
        clienteId: nueva.clienteId,
        asesorId: nueva.asesorId,
        descripcion: nueva.descripcion,
        valorEstimado: nueva.valorEstimado,
        probabilidad: 10,
        etapa: 'PROSPECCION',
        estado: 'ACTIVA',
        esPotencial: false,
        ventaId: null,
        fechaCierreEstimada: nueva.fechaCierreEstimada,
        fechaCreacion: '2026-05-28',
        fechaActualizacion: '2026-05-28',
      };
      fakeDB.oportunidades.push(creada);
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(creada),
      });
      return;
    }

    await route.continue();
  });

  /* INTERACCIONES */
  await page.route('**/interacciones**', async (route, request) => {
    const method = request.method();
    const url = request.url();
    console.log('[MOCK] interacciones:', method, url);

    if (method === 'GET' && url.includes('usuario')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(fakeDB.interacciones),
      });
      return;
    }

    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(fakeDB.interacciones),
      });
      return;
    }

    await route.continue();
  });

  /* VENTAS */
  await page.route('**/venta**', async (route, request) => {
    const method = request.method();
    const url = request.url();
    console.log('[MOCK] venta:', method, url);

    if (method === 'GET' && url.includes('buscarasesor')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(fakeDB.ventas),
      });
      return;
    }

    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(fakeDB.ventas),
      });
      return;
    }

    await route.continue();
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
